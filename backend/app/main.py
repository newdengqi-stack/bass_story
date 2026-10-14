import asyncio
import logging
import time
from collections import deque

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.middleware.trustedhost import TrustedHostMiddleware

from .config import Settings
from .errors import AnalysisError
from .gateway import DashscopeGateway, DeepseekGateway, MockGateway, ModelGateway
from .middleware import TraceAndLimitMiddleware
from .schemas import AnalyzeRequest, AnalyzeResponse, ErrorResponse, HealthResponse
from .service import ReviewService

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(name)s %(message)s')
logger = logging.getLogger('zhicheng.analysis')


def create_app(settings: Settings | None = None, gateway: ModelGateway | None = None) -> FastAPI:
    settings = settings or Settings()
    default_gateway = MockGateway() if settings.ai_mode == 'mock' else DeepseekGateway(settings) if settings.ai_mode == 'deepseek' else DashscopeGateway(settings)
    service = ReviewService(gateway or default_gateway)
    application = FastAPI(title='知程 AI 内部文本初评', version='0.1.0')
    application.add_middleware(TrustedHostMiddleware, allowed_hosts=['localhost', '127.0.0.1', 'testserver'])
    application.add_middleware(TraceAndLimitMiddleware)
    requests: deque[float] = deque()
    slots = asyncio.Semaphore(2)

    @application.exception_handler(AnalysisError)
    async def analysis_error(request: Request, exc: AnalysisError):
        trace = request.state.request_id
        logger.warning('analysis_failed request_id=%s code=%s', trace, exc.code)
        return JSONResponse({'error': {'code': exc.code, 'message': exc.message, 'request_id': trace, 'retryable': exc.retryable}}, status_code=exc.status)

    @application.exception_handler(RequestValidationError)
    async def validation_error(request: Request, _exc: RequestValidationError):
        return await analysis_error(request, AnalysisError('INVALID_INPUT', '请提交20至12000字的简历文本，并明确同意本次分析；不支持多余字段。', 422))

    @application.exception_handler(Exception)
    async def unexpected_error(request: Request, _exc: Exception):
        return await analysis_error(request, AnalysisError('INTERNAL_ERROR', '服务处理失败，请保留输入后重试。', 500, True))

    @application.get('/api/v1/health', response_model=HealthResponse)
    async def health():
        return HealthResponse(ai_mode=settings.ai_mode, model_configured=settings.configured)

    @application.post('/api/v1/resume-reviews/analyze', response_model=AnalyzeResponse,
                      responses={code: {'model': ErrorResponse} for code in (413, 422, 429, 502, 503, 504)})
    async def analyze(payload: AnalyzeRequest, request: Request):
        now = time.monotonic()
        while requests and now - requests[0] >= 60:
            requests.popleft()
        if len(requests) >= settings.analysis_requests_per_minute or slots.locked():
            raise AnalysisError('ANALYSIS_RATE_LIMITED', '本机分析请求较多，请稍后重试。', 429, True)
        requests.append(now)
        try:
            async with slots, asyncio.timeout(settings.ai_timeout_seconds + 5):
                result = await service.analyze(payload.text, request.state.request_id)
        except TimeoutError:
            raise AnalysisError('MODEL_TIMEOUT', '分析超时，输入仍保留，请稍后重试。', 504, True) from None
        logger.info('analysis_succeeded request_id=%s provider=%s model=%s elapsed_ms=%s input_tokens=%s output_tokens=%s',
                    result.request_id, result.metadata.provider, result.metadata.model, result.metadata.elapsed_ms,
                    result.metadata.input_tokens, result.metadata.output_tokens)
        return result

    return application


app = create_app()
