// app/router.ts
import { Application } from 'egg';

export default (app: Application) => {
  const { router, controller } = app;

  // 定义路由，指向 UserController 的 login 方法
  router.get('/user/login', controller.user.login);
};
