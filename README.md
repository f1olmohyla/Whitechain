## Cossacks Business — Whitechain Testnet

Smart‑контракти гри з механіками: ERC1155 ресурси, ERC721 предмети, Crafting/Search, Marketplace та MagicToken (ERC20). Версія Solidity: 0.8.24. Скрипти деплою — TypeScript (Hardhat).

### Контракти
- `contracts/ResourceNFT1155.sol` — базові ресурси ERC1155 (Wood, Iron, Gold, Leather, Stone, Diamond). Прямий мінт/спалення заборонені; лише ролі MINTER/BURNER (контракт Crafting/Search).
- `contracts/items/*` — предмети ERC721: `CossackSabre`, `ElderStaff`, `CharacternykArmor`, `BattleBracelet`. Мінт лише від Crafting/Search; спалення лише з Marketplace.
- `contracts/CraftingSearch.sol` — пошук ресурсів (1 раз на 60 с, 3 випадкових ресурси) та крафт 2 обов’язкових і 2 опціональних предметів (ресурси спалюються, предмет мінтиться).
- `contracts/MagicToken.sol` — ERC20, мінт виключно з `Marketplace`.
- `contracts/Marketplace.sol` — продаж предметів за MagicToken: контракт переводить NFT на себе, спалює і мінтить MagicToken продавцю за фіксованою винагородою.

### Вимоги
- Node.js 20+
- NPM/Yarn/Pnpm

### Встановлення
```bash
npm install
```

### Налаштування середовища
Створіть `.env` з параметрами (див. `env.example`):
```
PRIVATE_KEY=0x...
WHITECHAIN_RPC_URL=...
WHITECHAIN_CHAIN_ID=...
WHITECHAIN_EXPLORER_API_KEY=...
WHITECHAIN_EXPLORER_API_URL=...
WHITECHAIN_EXPLORER_BROWSER_URL=...`

Примітка щодо Whitechain Testnet: заповніть `WHITECHAIN_RPC_URL`, `WHITECHAIN_CHAIN_ID` та пари `WHITECHAIN_EXPLORER_*` відповідно до актуальних даних мережі/експлорера. Верифікація працює через Etherscan‑сумісний API.
```
### Компіляція
```bash
npm run build
```

### Тести (100% coverage)
```bash
npm test
npm run coverage
```

### Деплой у Whitechain Testnet
```bash
npm run deploy:whitechainTestnet
```
Після деплою адреси буде збережено у `deployments/whitechainTestnet.json`.

### Верифікація
Скрипт деплою автоматично намагається верифікувати контракти, якщо налаштований експлорер. За потреби можна повторити вручну:
```bash
npx hardhat verify --network whitechainTestnet <ADDRESS> <constructor args>
```

### Використання (з консолі Hardhat)
- Пошук ресурсів: `CraftingSearch.search()` — раз на 60 секунд, видає 3 випадкових ресурси.
- Крафт:
  - `craftCossackSabre()` — 3× Iron, 1× Wood, 1× Leather
  - `craftElderStaff()` — 2× Wood, 1× Gold, 1× Diamond
  - `craftCharacternykArmor()` — 4× Leather, 2× Iron, 1× Gold (опц.)
  - `craftBattleBracelet()` — 4× Iron, 2× Gold, 2× Diamond (опц.)
- Продаж предмета: дайте `approve` для `Marketplace`, викличте `Marketplace.sell(<itemAddress>, <tokenId>)`. Предмет переводиться на `Marketplace`, спалюється, а продавець отримує `MagicToken` згідно винагороди.

### Особливості безпеки та доступу
- Прямий мінт/спалення у `ResourceNFT1155` і `Item721` заборонені — лише ролі.
- Мінт `MagicToken` можливий лише з `Marketplace`.
- Спалення предметів відбувається тільки під час продажу у `Marketplace`.

### Задеплоєні адреси
- Додайте сюди після деплою (або див. `deployments/whitechainTestnet.json`):
  - `ResourceNFT1155`: ...
  - `CossackSabre`: ...
  - `ElderStaff`: ...
  - `CharacternykArmor`: ...
  - `BattleBracelet`: ...
  - `MagicToken`: ...
  - `Marketplace`: ...
  - `CraftingSearch`: ...


