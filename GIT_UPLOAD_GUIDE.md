# 📤 Как загрузить проект на GitHub/GitLab

## Шаг 1: Создайте репозиторий на GitHub

1. Зайдите на https://github.com
2. Войдите в аккаунт (или создайте новый)
3. Нажмите **"+"** → **"New repository"**
4. Заполните:
   - **Repository name:** `masterprofi` (или другое имя)
   - **Description:** `MasterProfi Service Platform`
   - **Visibility:** `Private` (рекомендуется) или `Public`
   - **НЕ** ставьте галочки на "Add README", "Add .gitignore", "Choose a license"
5. Нажмите **"Create repository"**

## Шаг 2: Инициализация Git в проекте

### В PowerShell выполните:

```powershell
# Перейдите в директорию проекта
cd "Z:\App RBT"

# Инициализируйте Git репозиторий
git init

# Добавьте все файлы (кроме тех, что в .gitignore)
git add .

# Создайте первый коммит
git commit -m "Initial commit: MasterProfi project"

# Добавьте удаленный репозиторий (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/masterprofi.git

# Или если используете SSH:
# git remote add origin git@github.com:YOUR_USERNAME/masterprofi.git

# Отправьте код на GitHub
git branch -M main
git push -u origin main
```

## Шаг 3: Настройка Git (если еще не настроено)

```powershell
# Укажите ваше имя и email
git config --global user.name "Ваше Имя"
git config --global user.email "your.email@example.com"
```

## Шаг 4: Аутентификация на GitHub

### Вариант A: Через Personal Access Token (рекомендуется)

1. Зайдите на GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Нажмите **"Generate new token (classic)"**
3. Заполните:
   - **Note:** `MasterProfi Project`
   - **Expiration:** Выберите срок действия
   - **Scopes:** Отметьте `repo` (полный доступ к репозиториям)
4. Нажмите **"Generate token"**
5. **Скопируйте токен** (он показывается только один раз!)

При `git push` введите:
- **Username:** ваш GitHub username
- **Password:** вставьте токен (не пароль!)

### Вариант B: Через GitHub CLI

```powershell
# Установите GitHub CLI (если нет)
winget install --id GitHub.cli

# Авторизуйтесь
gh auth login
```

### Вариант C: Через SSH ключ

1. Создайте SSH ключ (если еще нет):
```powershell
ssh-keygen -t ed25519 -C "your_email@example.com"
```

2. Скопируйте публичный ключ:
```powershell
cat ~/.ssh/id_ed25519.pub
```

3. На GitHub: **Settings** → **SSH and GPG keys** → **New SSH key**
4. Вставьте ключ и сохраните

5. Используйте SSH URL:
```powershell
git remote set-url origin git@github.com:YOUR_USERNAME/masterprofi.git
```

## Шаг 5: Загрузка проекта

После настройки выполните:

```powershell
cd "Z:\App RBT"
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Альтернатива: GitLab

Если используете GitLab:

1. Зайдите на https://gitlab.com
2. Создайте новый проект
3. Используйте команды:

```powershell
git init
git add .
git commit -m "Initial commit"
git remote add origin https://gitlab.com/YOUR_USERNAME/masterprofi.git
git push -u origin main
```

## Полезные команды Git

```powershell
# Проверить статус
git status

# Посмотреть изменения
git diff

# Добавить конкретный файл
git add filename.txt

# Создать коммит
git commit -m "Описание изменений"

# Отправить изменения
git push

# Получить изменения с сервера
git pull

# Посмотреть историю
git log

# Создать новую ветку
git checkout -b feature/new-feature

# Переключиться на ветку
git checkout main
```

## Решение проблем

### Ошибка: "remote origin already exists"
```powershell
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/masterprofi.git
```

### Ошибка: "Authentication failed"
- Проверьте правильность токена/пароля
- Используйте Personal Access Token вместо пароля

### Ошибка: "Permission denied"
- Проверьте права доступа к репозиторию
- Убедитесь, что используете правильный username

### Большой размер репозитория
Если проект очень большой, используйте Git LFS:
```powershell
git lfs install
git lfs track "*.zip"
git lfs track "*.pdf"
```

## После загрузки на сервер

На сервере выполните:

```bash
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/masterprofi.git
cd masterprofi
```

Или с SSH:
```bash
sudo git clone git@github.com:YOUR_USERNAME/masterprofi.git
```

