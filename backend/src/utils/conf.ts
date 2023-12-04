export const black_list = [
  "/user/logout",
  "/user/modify",

  "/category/add",
  "/category/modify",

  "/contest/add",
  "/contest/delete",
  "/contest/modify",

  "/record/add",
  "/record/delete",
  "/record/modify",
];

export const errorcode = {
  SUCCESS: 200, // 成功
  UNKNOWN: -1, // 未知错误
  INTERNEL_ERROR: -2, // 内部错误
  BAD_ARGUMENTS: -3, // 参数错误
  NO_PERMISSION: -4, // 没有权限
  NONEXISTING: -5, // 目标不存在
  DONT_MEETING_EXCEPTION: -6, // 不符合预期

  FRONTEND_ERROR: -99, // 前端错误（预留给前端，后端不会发出该错误）

  TOKEN_FAILED: -101, // Token不存在
  TOKEN_OUTDATED: -102, // Token过期
  TOKEN_OUTDATE: -103, // Token过期

  USER_REGISTER_EXISTING: -151, // 注册时用户已经存在
  USER_REGISTER_FAILED: -152, // 注册失败
  USER_LOGIN_ERROR: -153, // 登录失败
  USER_PASSWD_ERROR: -154, // 登录密码失败
  USER_MODIFY_ERROR: -155, // 修改用户信息失败
  USER_QUERY_ERROR: -156, // 查询用户信息失败
  USER_LIST_ERROR: -157, // 列出用户信息失败

  CATEGORY_ADD_ERROR: -201, // 添加类别失败
  CATEGORY_MODIFY_ERROR: -202, // 修改类别失败
  CATEGORY_LIST_ERROR: -204, // 列出类别失败
  CATEGORY_DELETE_ERROR: -205, // 添加类别失败

  CONTEST_ADD_ERROR: -251, // 添加比赛失败
  CONTEST_DELETE_ERROR: -252, // 删除比赛失败
  CONTEST_MODIFY_ERROR: -253, // 修改比赛失败
  CONTEST_QUERY_ERROR: -254, // 查询比赛失败
  CONTEST_LIST_ERROR: -255, // 列出比赛失败

  RECORD_ADD_ERROR: -301, // 添加记录失败
  RECORD_DELETE_ERROR: -302, // 删除记录失败
  RECORD_MODIFY_ERROR: -303, // 修改记录失败
  RECORD_QUERY_ERROR: -304, // 查询记录失败
  RECORD_LIST_ERROR: -305, // 列出记录失败
};

export const tips = {
  UNKNOWN_ERROR: "未知错误",
  INTERNEL_ERROR: "内部错误",
  BAD_ARGUMENTS: "参数错误",
  NO_PERMISSION: "操作无权限",
  NONEXISTING: "操作目标不存在",
  DONT_MEETING_EXCEPTION: "系统内部不自洽",

  TOKEN_UNDEFINED: "您无权限操作此区域",
  TOKEN_OUTDATE: "登录信息已过期，请重新登录",

  REGISTER_SUCCESS: "注册成功",
  REGISTER_FAILED_USERNAME_EXISTING: "注册失败，用户名已存在",
  REGISTER_FAILED_PASSWORD_ILLEGAL: "注册失败，密码非法",
  REGISTER_FAILED_USERNAME_ILLEGAL: "注册失败，用户名非法",
  REGISTER_FAILED_NICKNAME_ILLEGAL: "注册失败，昵称非法",
  REGISTER_FAILED_EMAIL_ILLEGAL: "注册失败，邮箱非法",
  REGISTER_FAILED_DESCRIPTION_ILLEGAL: "注册失败，描述非法",

  LOGIN_SUCCESS: "登录成功",
  LOGIN_FAILED_USERNAME_ILLEGAL: "登录失败，用户名非法",
  LOGIN_FAILED_PASSWORD_ILLEGAL: "登录失败，密码非法",
  LOGIN_FAILED_PASSWORD_INCORRECT: "登录失败，密码错误",
  LOGIN_FAILED_UNKNOWN: "登录失败，未知原因",
  LOGOUT_SUCCESS: "注销成功",

  USER_MODIFY_SUCCESS: "修改用户信息成功",
  USER_MODIFY_FAILED_DESCRIPTION_ILLEGAL: "修改用户信息失败，描述非法",
  USER_MODIFY_FAILED_EMAIL_ILLEGAL: "修改用户信息失败，邮箱非法",
  USER_MODIFY_FAILED_NICKNAME_ILLEGAL: "修改用户信息失败，昵称非法",
  USER_QUERY_SUCCESS: "查询用户信息成功",
  USER_QUERY_FAILED_USERNAME_ILLEGAL: "查询用户信息失败，用户名非法",
  USER_QUERY_FAILED_BOTH_USERID_AND_USERNAME:
    "查询用户信息失败，用户名和ID只能指定一个",
  USER_QUERY_FAILED_BAD_FORMAT: "查询用户信息失败，格式非法",
  USER_SEARCH_SUCCESS: "搜索用户成功",
  USER_LIST_SUCCESS: "列出用户成功",

  CATEGORY_ADD_SUCCESS: "添加类别成功",
  CATEGORY_ADD_FAILED_NAME_ILLEGAL: "添加类别失败，名称非法",
  CATEGORY_ADD_FAILED_DESCRIPTION_ILLEGAL: "添加类别失败，描述非法",
  CATEGORY_ADD_FAILED_NAME_EXISTING: "添加类别失败，名称已存在",
  CATEGORY_MODIFY_SUCCESS: "修改类别成功",
  CATEGORY_MODIFY_FAILED_NAME_EXISTING: "修改类别失败，名称已存在",
  CATEGORY_QUERY_SUCCESS: "查询类别成功",
  CATEGORY_LIST_SUCCESS: "列出类别成功",
  CATEGORY_LIST_FAILED_TOO_MANY: "列出类别失败，查询数量过多",
  CATEGORY_DELETE_SUCCESS: "删除类别成功",
  CATEGORY_DELETE_FAILED_OCCUPIED:
    "删除类别失败，类别被占用，请删除所有使用此类别的比赛",

  CONTEST_ADD_SUCCESS: "添加比赛成功",
  CONTEST_DELETE_SUCCESS: "删除比赛成功",
  CONTEST_MODIFY_SUCCESS: "修改比赛成功",
  CONTEST_QUERY_SUCCESS: "查询比赛成功",
  CONTEST_LIST_SUCCESS: "列出比赛成功",
  CONTEST_LIST_FAILED_TOO_MANY: "列出比赛失败，查询数量过多",

  RECORD_ADD_SUCCESS: "添加记录成功",
  RECORD_DELETE_SUCCESS: "删除记录成功",
  RECORD_MODIFY_SUCCESS: "添加记录成功",
  RECORD_QUERY_SUCCESS: "查询记录成功",
  RECORD_LIST_SUCCESS: "列出记录成功",
  RECORD_LIST_FAILED_TOO_MANY: "列出记录失败，查询数量过多",
};

export const QUERY_MAX_LIMIT = 5000;
