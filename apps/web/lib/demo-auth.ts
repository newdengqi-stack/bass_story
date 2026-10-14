// 演示账号 —— 本项目尚无后端（见 design.md D4），登录只做本地校验。
//
// ⚠️ 这不是认证，只是让演示能走通的一把钥匙。
// 接入真实认证时，把这两个常量连同调用方的校验一起换成 API 调用，不要保留这里的任何判断。
// 绝不可让这段逻辑以任何形式残留到有真实用户数据的版本里。

export const DEMO_EMAIL = 'demo@zhitu.app'
export const DEMO_PASSWORD = 'zhitu2026'

/** 登录成功后的落地页 */
export const AFTER_LOGIN = '/dashboard'

/** 注册成功后的落地页 —— 新用户先去引导向导 */
export const AFTER_REGISTER = '/onboarding'

/** 凭据是否匹配演示账号 */
export function matchesDemoAccount(email: string, password: string): boolean {
  return email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD
}
