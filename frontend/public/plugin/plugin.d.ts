
/// <reference lib="quickjs"/>

/**
 * 记录数据
 */
interface RecordData {
  /**
   * 记录ID（保证唯一）
   */
  readonly recordId: string;
  /**
   * 选手ID（每场比赛不重复）
   */
  readonly playerId: string;
  /**
   * 选手昵称
   */
  readonly playerNickname: string;
  /**
   * 量化分数
   */
  readonly score: number;
  /**
   * 数据内容
   */
  content: any;
}

/**
 * 表格列属性
 */
interface TableColumnConfig {
  /*
   * 表头名称。（需要保证唯一）
   */
  label: string;
  /**
   * 获取器
   * @param x 原数据
   * @returns 表格呈现内容
   */
  getter: (x: RecordData)=> string;
  /**
   * 排序功能。
   * 
   * 此项只能被设置为函数，如果此项被设置，则允许用户对表格进行排序。
   * 
   * @param lhs 左元
   * @param rhs 右元
   * @returns 一个数字表示顺序，负值表示小于，零值表示等于，正值表示大于
   * 
   * 弱序如下：
   *   - 六个关系运算符（==，!=，<，<=，>，>=）均存在
   *   - 不隐含含可替代性：若a等于b，则f(a)可能不等于f(b)
   *   - 不允许不可比较：a<b、a==b、a>b必须至少有一个为true
   */
  sorter?: (lhs: RecordData, rhs: RecordData)=> number;

  /**
   * 染色功能。
   * 
   * 此项只能被设置为函数，如果此项被设置，则允许展现彩色单元格。
   * 
   * @param data 输入数据
   * @returns 符合CSS的颜色字符串（如十六进制RGB格式、颜色名称等）
   */
  // color?: (data: RecordData)=> string;

  /**
   * 筛选功能。
   * 
   * - 若此项被设置为布尔量
   *   - 值为true表示直接采用getter的结果作为筛选项
   *   - 值为false等效于不设置，即不启用筛选功能
   * - 若此项设置为函数，传入数据后返回表示筛选项的字符串，相同的返回值视在同一个集合中。
   */
  // filter?: boolean | ((data: RecordData)=> string);

  /**
   * 设置器。
   * 
   * 此项只能被设置为函数，设置此项即允许直接从修改修改内容。
   * 
   * 函数不需要具有返回值，请使用相关接口直接修改函数。
   * 
   * @param data 原数据
   * @param value 用户输入的内容
   * 
   * @returns 是否接受设置
   */
  // setter: (data: RecordData, value: string)=> boolean;
}

/**
 * 注册表格列。
 * 
 * 表格展现的数据将依照注册顺序依次呈现。
 * 
 * @param label 表头名称（需要唯一）
 * @param getter 获取器（传入表格数据后返回呈现在表格中的结果）
 * @param config 额外配置（参见TableColumnConfig）
 */
declare function registerTableColumn(config: TableColumnConfig): boolean;

/**
 * 注册分数计算器。
 * 
 * @param fn 更新函数，传入表格数据后返回供评估的分数。
 */
declare function registerScoreCalculator(fn: (data: RecordData)=> number): void;

/**
 * 声明表格形式。
 * 
 * 传入样本数据，根据样本数据中的各个类型来规范原始数据。
 * 
 * 此函数至多只能被调用一次，如果不调用则表示维持原始数据不变。
 * 
 * 转换规则如下：
 * |             | 数字                                                         | 字符串                                                       | 布尔                            | 数组                     | 对象         | null/未定义 |
 * | ----------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------- | ------------------------ | ------------ | ----------- |
 * | 数字        | 不转换                                                       | 字符串化                                                     | +0和-0被转为false，其余为true   | 仅包括原数字的一个数组   | 转换失败     | 直接删除    |
 * | 字符串      | 尝试转换，如果数字格式非法转换失败                           | 不转换                                                       | 字符串非空则为true，否则为false | 仅包括原字符串的一个数组 | 转换失败     | 直接删除    |
 * | 布尔        | true为1，false为0                                            | true为"true",false为"false"                                  | 不转换                          | 仅包括原布尔的一个数组   | 转换失败     | 直接删除    |
 * | 数组        | 如果数组只包括一个数字/字符串/布尔，则尝试解开数组并转换；否则转化失败 | 如果数组只包括一个数字/字符串/布尔，则尝试解开数组并转换；否则失败 | 空数组为false，否则为false      | 递归应用规则             | 转换失败     | 直接删除    |
 * | 对象        | 转换失败                                                     | 转换失败                                                     | 空对象为false，否则为true       | 转换失败                 | 递归应用规则 | 直接删除    |
 * | null/未定义 | +0                                                           | 空字符串                                                     | false                           | 空数组                   | 空对象       | 不转换      |
 *
 * @param form 模板
 */
declare function declareDataForm(sample: any);

/**
 * 分类信息
 */
interface CategoryInfo {
  /**
   * 分类ID
   */
  id: string;
  /**
   * 名称
   */
  title: string;
  /**
   * 描述
   */
  description: string;
}

/**
 * 获取当前比赛的分类信息。
 * 
 * @returns 分类信息
 */
declare function getCategoryInfo(): CategoryInfo;
