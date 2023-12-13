'use strict'

// 声明数据格式
declareDataForm([{ problem: 'A', submits: [{ time: 0, state: 'Accepted' }] }])

/**
 * @typedef {{
 *    problem: string;
 *    submits: {
 *      time: number;
 *      state: string;
 *    }[]
 *  }[]} MyContent
 */

// 定义分数计算器
registerScoreCalculator('20231213', (x) => {
  /** @type {MyContent} 原数据 */
  const content = x.content

  let penalty = 0; // 总罚时
  let accepted = 0; // 总过题数
  for(let problem of content) {
    let _penalty = 0; // 当前题目罚时
    let _accepted = false; // 当前题是否通过
    for(let sumbit of problem.submits) {
      if(sumbit.state == 'Accepted') { // 通过此题
        _penalty += sumbit.time;
        _accepted = true;
        break; // AC之后的提交均被忽略
      } else {
        _penalty += 20 * 60; // 罚时20分钟
      }
    }
    if(_accepted) { // 过题才能计算罚时
      ++accepted;
      penalty += _penalty;
    }
  }

  // 量化分数，保证过题数为第一关键词，罚时为第二关键词
  return accepted + Math.E ** (-penalty);
})
