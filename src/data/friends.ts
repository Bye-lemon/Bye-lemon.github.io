export type FriendKind = 'industry' | 'academic';

export interface Friend {
  name: string;
  url: string;
  kind: FriendKind;
  /** 学术界：机构（中文名），与 name/title 一起渲染成「机构·姓名+职位」 */
  university?: string;
  /** 学术界：职位，如 博士 / 研究员 / 讲师 / 教授 */
  title?: string;
}

export const friends: Friend[] = [
  { name: '叶老师的博客', url: 'https://laurenfrost.ink/', kind: 'industry' },
  { name: '爱宾的博客', url: 'https://leslieaibin.github.io/', kind: 'industry' },
  { name: '炳君的博客', url: 'https://leebinjun.github.io/index.html', kind: 'industry' },
  { name: '李运恒', url: 'https://lyhisme.github.io/', kind: 'academic', university: '南开大学', title: '博士' },
  { name: '陈建川', url: 'https://janaldochen.github.io/', kind: 'academic', university: '阿里巴巴', title: '研究员' },
];
