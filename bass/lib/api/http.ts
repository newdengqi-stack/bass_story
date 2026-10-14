import {
  array,
  bool,
  enumValue,
  pollTask,
  record,
  request,
  string,
} from './client'
import { mapCandidate, mapReport, mapReviewStatus } from './guards'
import type { BusinessApi } from './types'
const id = encodeURIComponent
const json = (
  body: unknown,
  signal?: AbortSignal,
  key?: string,
): RequestInit => ({
  method: 'POST',
  body: JSON.stringify(body),
  signal,
  headers: key ? { 'Idempotency-Key': key } : undefined,
})
export const httpApi: BusinessApi = {
  async parseResume(input, signal) {
    const key = crypto.randomUUID()
    let options: RequestInit
    if (input.file) {
      const form = new FormData()
      form.append('file', input.file)
      form.append('consent', String(input.consent))
      options = {
        method: 'POST',
        body: form,
        signal,
        headers: { 'Idempotency-Key': key },
      }
    } else
      options = json(
        { text: input.text, consent: input.consent, source: 'manual' },
        signal,
        key,
      )
    const task = record(
      await request(`/api/v1/resumes${input.file ? '' : '/text'}`, options),
    )
    const resumeId = await pollTask(string(task.task_id), signal)
    return mapCandidate(
      await request(`/api/v1/resumes/${id(resumeId)}/draft`, { signal }),
    )
  },
  async confirmCandidate(input, signal) {
    return mapCandidate(
      await request(`/api/v1/resumes/${id(input.resumeId)}/confirmation`, {
        ...json(
          {
            source_version: input.version,
            source_text: input.source,
            skill_claims: input.skills,
            project: input.noProject
              ? null
              : { name: input.projectName, contribution: input.contribution },
            facts_confirmed: true,
          },
          signal,
        ),
        method: 'PUT',
      }),
    )
  },
  async reviewCandidate(input, signal) {
    const data = record(
      await request(`/api/v1/resumes/${id(input.resumeId)}/review`, { signal }),
    )
    return array(data.dimensions).map((value) => {
      const d = record(value)
      return {
        id: string(d.id),
        title: string(d.title),
        status: enumValue(d.status, ['clear', 'improve', 'unknown', 'na']),
        quote: d.quote == null ? undefined : string(d.quote),
        explanation: string(d.explanation),
        action: d.action == null ? undefined : string(d.action),
      }
    })
  },
  async analyzeRole(text, role, signal) {
    const data = record(
      await request(
        '/api/v1/roles/analyze',
        json({ jd_text: text, role_id: role }, signal),
      ),
    )
    return array(data.requirements).map((value) => {
      const r = record(value)
      return {
        skill: string(r.skill),
        quote: string(r.quote),
        importance: enumValue(r.importance, [
          'must',
          'important',
          'bonus',
          'pending',
        ]),
        confirmed: bool(r.confirmed),
      }
    })
  },
  async createAssessment(input, signal) {
    const d = record(
      await request(
        '/api/v1/assessments',
        json(
          {
            mode: input.mode,
            role_profile_id: input.mode === 'skillonly' ? null : input.role,
            candidate_snapshot_id: input.candidateId,
          },
          signal,
          input.key ?? crypto.randomUUID(),
        ),
      ),
    )
    return {
      id: string(d.id),
      version: string(d.version),
      questions: array(d.questions).map((value) => {
        const q = record(value)
        return {
          id: string(q.id),
          version: string(q.version),
          dimension: string(q.dimension),
          prompt: string(q.prompt),
          hint: string(q.hint),
        }
      }),
    }
  },
  async saveAnswer(
    assessment,
    question,
    answer,
    status,
    key,
    signal,
    versions,
  ) {
    const response = record(
      await request(
        `/api/v1/assessments/${id(assessment)}/answers/${id(question)}`,
        {
          ...json(
            {
              answer: status === 'skipped' ? null : answer,
              state: status,
              question_version: versions?.question,
              expected_version: versions?.assessment,
            },
            signal,
            key,
          ),
          method: 'PUT',
        },
      ),
    )
    return string(response.version)
  },
  async submit(assessment, key, signal) {
    return mapReviewStatus(
      await request(
        `/api/v1/assessments/${id(assessment)}/submission`,
        json({}, signal, key),
      ),
    )
  },
  async reviewStatus(submission, signal) {
    return mapReviewStatus(
      await request(`/api/v1/submissions/${id(submission)}/review-status`, {
        signal,
      }),
    )
  },
  async report(submission, signal) {
    return mapReport(
      await request(`/api/v1/submissions/${id(submission)}/report`, { signal }),
    )
  },
  async deleteData(signal) {
    const d = record(
      await request('/api/v1/sessions/current/data', {
        method: 'DELETE',
        signal,
        headers: { 'Idempotency-Key': crypto.randomUUID() },
      }),
    )
    return {
      receiptId: string(d.deletion_receipt_id),
      state: enumValue(d.state, ['pending', 'completed']),
    }
  },
}
