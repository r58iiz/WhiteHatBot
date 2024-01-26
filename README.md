# Whitehat Bot

Discord bot written for WhiteHat Hacking discord server.

## Debugging

- To check for errors:
  - Watch mode:
    - `cls; npx tsc --watch --noEmit --project './tsconfig.json';`
  - Once:
    - `cls; npx tsc --noEmit --project './tsconfig.json';`

- To lint code:
  - `npm run lint`

- To format code:
  - `npm run format`

- To test code:
  - `npm run dev`

## Quickstart

1. Rename `.env.example` to `.env`
2. Paste discord token, client ID, guild ID in `.env`
3. Change prefix, if required.
4. Run `npm ci`
5. Run `npm run build`
6. Run `npm run start`
7. All logs go in `prod.log`

## To-Do

- [ ] Store settings
- [ ] Create logging channel
  - [ ] Send moderation logs
  - [ ] Send spam logs
  - [ ] Send link logs
  - [ ] Send file scan logs
- [ ] Allow disabling of commands/categories
- [ ] Allow blocking of users
- [ ] Add modmail feature
- [ ] Add permission handling for text commands
- [ ] Add help command
- [ ] Add commands
  - [ ] Timeout
  - [ ] Mute (role)
  - [ ] Warn
  - [ ] Note
- [ ] Add more command properties
- [ ] Add context menu based commands
