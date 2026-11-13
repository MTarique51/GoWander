# Seeded demo accounts

Run `cd server && npm run seed` after configuring `server/.env`.

| Role              | Email                  | Password     |
| ----------------- | ---------------------- | ------------ |
| Admin             | admin@gowander.demo    | Admin@123    |
| Provider 1        | provider@gowander.demo | Provider@123 |
| Provider 2        | meera@gowander.demo    | Provider@123 |
| Provider 3        | riya@gowander.demo     | Provider@123 |
| Traveler          | traveler@gowander.demo | Traveler@123 |
| Pending applicant | pending@gowander.demo  | Pending@123  |

**Warning:** The seed command deletes all documents in every GoWander collection before recreating this sample dataset. Use only on a disposable development database. Never run it against production data.
