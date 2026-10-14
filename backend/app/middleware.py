import asyncio
from uuid import uuid4

from starlette.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send


class TraceAndLimitMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send):
        if scope['type'] != 'http':
            return await self.app(scope, receive, send)
        request_id = str(uuid4())
        scope.setdefault('state', {})['request_id'] = request_id

        async def traced_send(message):
            if message['type'] == 'http.response.start':
                message['headers'] = [*message.get('headers', []), (b'cache-control', b'no-store'), (b'x-request-id', request_id.encode())]
            await send(message)

        if scope['method'] != 'POST':
            return await self.app(scope, receive, traced_send)
        body = bytearray()
        try:
            async with asyncio.timeout(5):
                while True:
                    message = await receive()
                    if message['type'] == 'http.disconnect':
                        return
                    body.extend(message.get('body', b''))
                    if len(body) > 65536:
                        response = JSONResponse({'error': {'code': 'REQUEST_TOO_LARGE', 'message': '请求体过大，请缩短简历文本。', 'request_id': request_id, 'retryable': False}}, status_code=413)
                        return await response(scope, receive, traced_send)
                    if not message.get('more_body', False):
                        break
        except TimeoutError:
            response = JSONResponse({'error': {'code': 'REQUEST_TIMEOUT', 'message': '上传请求超时，请重试。', 'request_id': request_id, 'retryable': True}}, status_code=408)
            return await response(scope, receive, traced_send)
        delivered = False

        async def replay_receive():
            nonlocal delivered
            if not delivered:
                delivered = True
                return {'type': 'http.request', 'body': bytes(body), 'more_body': False}
            return await receive()

        await self.app(scope, replay_receive, traced_send)
