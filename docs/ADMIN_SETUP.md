# Yönetim paneli kurulumu

Roller D1 kaynaklıdır: `admin` tüm izinler, `editor` duyuru okuma/yazma/yayın,
`support` yalnız duyuru okuma, `user` ise yönetim izni olmayan varsayılan roldür.
JWT yalnız subject doğrular; metadata, e-posta ve istemci rolü yetki vermez.

İlk kullanıcı normal Supabase girişini tamamladıktan ve Worker uygulama `users.id`
değeri doğrulandıktan sonra operatör tarafından atanır:

```sql
INSERT INTO user_roles (user_id, role, active, created_at, updated_at)
VALUES ('<D1_INTERNAL_USER_UUID>', 'admin', 1, <EPOCH_MS>, <EPOCH_MS>);
```

Yetki kaldırmak için `active=0` yapılır; satır silinmez. Yönetim paneli secret
yönetim paneli değildir. Audit kayıtları token, anahtar veya gereksiz kişisel
veri içermez. Hesap ele geçirilirse rol derhal pasifleştirilir, Supabase
oturumları kapatılır, audit kaydı incelenir ve gerekli secretlar döndürülür.

İzinli ayarlar: `maintenance_mode`, `maintenance_message`,
`minimum_web_version`, `minimum_android_version`, `free_analysis_limit`,
`support_email`. Remote uygulama öncesi export alınır, migration uygulanır,
ardından `GET /health` ve `GET /admin/me` test edilir.
