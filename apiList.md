# PairPro APIs

### authRouter

- POST /signup
- POST /login
- POST /logout

### profileRouter

- GET /profile/view
- PATCH /profile/update
- PATCH /profile/password

### requestRouter

- POST /request/send/:status/:userId
- POST /request/review/:status/:requestId

### userRouter

- GET /user/connections
- GET /user/request
- GET /user/feed
