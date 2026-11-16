export type FriendKind = 'industry' | 'academic';

export interface Friend {
  name: string;
  url: string;
  kind: FriendKind;
  /** 产业界：一句话介绍（公司/方向） */
  description?: string;
  /** 学术界：学校或机构（中文名），与 title 一起渲染成「大学·职位」 */
  university?: string;
  /** 学术界：博士研究生 / 博士 / 研究员 / 讲师 / 副教授 / 教授 等 */
  title?: string;
  /** 学术界：可选的补充说明（实验室、导师等） */
  note?: string;
}

export const friends: Friend[] = [
  {
    name: 'Library of Babel',
    url: 'https://libraryofbabel.info',
    kind: 'industry',
    description: '博尔赫斯图书馆的在线实现',
  },
  {
    name: '陈建川',
    url: 'https://janaldochen.github.io/',
    kind: 'industry',
    description: '阿里巴巴集团 · 3D 数字人与神经渲染',
  },
  {
    name: '炳君',
    url: 'https://leebinjun.github.io/index.html',
    kind: 'industry',
    description: '硬件、机器人与日常折腾',
  },
  {
    name: '张乐斌',
    url: 'https://leslieaibin.github.io/',
    kind: 'industry',
    description: '大疆创新 · AI Agent / 后端工程师',
  },
  {
    name: '叶老师',
    url: 'https://laurenfrost.ink/',
    kind: 'industry',
    description: '东京 · 物流创业公司，GIS / 云架构',
  },
  {
    name: '李运恒',
    url: 'https://lyhisme.github.io/',
    kind: 'academic',
    university: '南开大学',
    title: '博士研究生',
    note: 'VCIP / MCLab，导师 程明明、侯淇彬',
  },
];
