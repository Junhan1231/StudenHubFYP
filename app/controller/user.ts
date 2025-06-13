// app/controller/user.ts
import { Controller } from 'egg';

export default class UserController extends Controller {
  public async login() {
    const { ctx } = this;
    const { name, pwd } = ctx.query;

    // 打印接收到的请求参数，调试日志
    ctx.logger.info(`Login request: name=${name}, pwd=${pwd}`);

    // 进行登录验证
    if (name === 'JunhanDang' && pwd === '123456') {
      ctx.body = {
        success: true,
        message: 'Login successful',
      };
    } else {
      ctx.body = {
        success: false,
        message: 'Invalid username or password',
      };
    }
  }
}
