import { EggAppConfig, PowerPartial } from 'egg';

export default () => {
  const config: PowerPartial<EggAppConfig> = {};

  // 设置密钥（需要更改为一个随机生成的安全密钥）
  config.keys = 'D1998529';  // 用自己的随机密钥替换

  // 配置其他内容（开发环境下可关闭 CSRF）
  config.security = {
    csrf: {
      enable: false, // 开发环境下可以关闭 CSRF 检查
    },
  };

  // 配置日志等级
  config.logger = {
    level: 'INFO',  // 设置日志级别为 INFO 或者 DEBUG
  };

  // 配置服务器监听所有 IP 地址，使得局域网设备可以访问
  config.host = '172.20.10.15';  // 绑定到局域网 IP 地址
  config.port = 7001;  // 监听端口 7001

  config.cors = {
    origin: '*',  // 允许所有源访问
    credentials: true,  // 支持携带凭证
  };
  

  return config;
};
