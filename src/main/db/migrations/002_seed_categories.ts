export const migration002SeedCategories = `
INSERT INTO categories (type, name, name_key, sort_order, is_system) VALUES
  ('expense', '饮食', 'category.food', 1, 1),
  ('expense', '交通', 'category.transport', 2, 1),
  ('expense', '住房', 'category.housing', 3, 1),
  ('expense', '水电燃气', 'category.utilities', 4, 1),
  ('expense', '娱乐', 'category.entertainment', 5, 1),
  ('expense', '购物', 'category.shopping', 6, 1),
  ('expense', '医疗', 'category.medical', 7, 1),
  ('expense', '教育', 'category.education', 8, 1),
  ('expense', '通讯', 'category.communication', 9, 1),
  ('expense', '其他支出', 'category.otherExpense', 10, 1),
  ('income', '工资', 'category.salary', 1, 1),
  ('income', '奖金', 'category.bonus', 2, 1),
  ('income', '兼职', 'category.sideIncome', 3, 1),
  ('income', '投资收益', 'category.investment', 4, 1),
  ('income', '其他收入', 'category.otherIncome', 5, 1);

INSERT INTO app_settings (key, value) VALUES ('language', 'zh');
`
