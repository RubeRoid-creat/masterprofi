# ✅ Ошибка исправлена!

## 🐛 Проблема:
Internal Server Error при загрузке MLM страницы

## 🔍 Причина:
В методе `getOverallStats()` использовалось поле `referral.level`, которого не существует в entity Referral.

## ✅ Решение:
Исправлен SQL запрос - теперь используется `bonus.level` из entity Bonus:

```typescript
// Было:
const statsByLevel = await this.referralRepository
  .createQueryBuilder('referral')
  .select('COUNT(*)', 'count')
  .groupBy('referral.level') // ❌ поле не существует
  .getRawMany();

// Стало:
const statsByLevel = await this.bonusRepository
  .createQueryBuilder('bonus')
  .select('bonus.level', 'level')
  .addSelect('COUNT(*)', 'count')
  .groupBy('bonus.level') // ✅ правильное поле
  .getRawMany();
```

---

**Перезапустите backend сервер для применения исправления!**

