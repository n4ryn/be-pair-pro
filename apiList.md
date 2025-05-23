# DevTinder APIs

### authRouter

- POST /signup
- POST /login
- POST /logout

### profileRouter

- GET /profile/view
- PATCH /profile/update
- PATCH /profile/password

### requestRouter

- POST /request/send/interested/:userId
- POST /request/send/ignore/:userId
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

### userRouter

- GET /user/connections
- GET /user/request/received
- GET /user/feed
