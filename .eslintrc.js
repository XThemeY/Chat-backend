module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  root: true,
  env: {
    node: true,
    jest: true
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn', // Запрещает использование типа any в TypeScript
    'prettier/prettier': [
      'error',
      {
        semi: true, // Обязывает использовать точки с запятой в конце выражений
        endOfLine: 'auto',
        trailingComma: 'none' // Отключает запятые после последнего элемента в массивах и объектах
      }
    ],
    'no-shadow': 'off', // Запрещает объявление переменных в области видимости, перекрывающих переменные в верхней области
    semi: ['error', 'always'], // Обязывает использовать точки с запятой
    'comma-dangle': ['error', 'never'], // Отключает запятые после последнего элемента
    eqeqeq: 'error', // Обязывает использовать === и !== вместо == и !=
    'no-var': 'error', // Запрещает использование var, вместо него используйте let или const
    '@typescript-eslint/no-namespace': 'off', // Отключает ограничение на имена пространств имен
    '@typescript-eslint/promise-function-async': 'error', // Обязывает использовать async для функций, возвращающих Promise
    '@typescript-eslint/await-thenable': 'error', // Запрещает использование await с не-thenable объектами
    curly: 'error', // Обязывает использование фигурных скобок для всех блоков (if, else и т.д.)
    '@typescript-eslint/prefer-for-of': 'error', // Предпочитает использование for-of вместо традиционных for циклов
    'guard-for-in': 'error', // Обязывает использовать проверку в for-in циклах (например, if (obj.hasOwnProperty(key)))
    'no-console': ['warn', { allow: ['warn', 'error'] }], // Запрещает использование console.log, но позволяет console.warn и console.error
    'no-debugger': 'error', // Запрещает использование debugger
    'no-duplicate-case': 'error', // Запрещает дублирование case в switch операторах
    'no-template-curly-in-string': 'error', // Запрещает использование template string placeholders в обычных строках
    '@typescript-eslint/no-misused-new': 'error', // Запрещает неправильное использование new с классами
    '@typescript-eslint/return-await': 'off', // Запрещает возвращение await в async функциях
    'no-fallthrough': 'error', // Запрещает "провал" в следующий case в switch операторах без break
    'no-constant-condition': 'error', // Запрещает использование константных условий в выражениях (например, while (true))
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Разрешает объявление переменных, которые не используются
    'no-restricted-syntax': ['error', 'StaticThisExpression'], // Запрещает использование определенных синтаксических конструкций (например, static this)
    'default-case': 'error', // Требует наличие default case в switch операторах
    '@typescript-eslint/no-require-imports': 'off', // Разрешает использование require() для импорта модулей
    'prefer-const': 'error', // Предпочитает использование const для объявлений переменных, которые не изменяются
    'arrow-body-style': ['off'], // Требует использования тела стрелочной функции только когда это необходимо
    'max-len': ['error', { code: 150 }] // Ограничивает максимальную длину строки до 150 символов
    //  quotes: ['error', 'single'] // Требует использования одинарных кавычек для строк
  }
};
