module.exports = {
    moduleFileExtensions: ['ts', 'js'],
    moduleNameMapper: {
        '@/(.*)': '<rootDir>/src/$1'
    },
    globals: {
        'ts-jest': {
            babel: true,
            tsconfig: 'tsconfig.json'
        }
    },
    transform: {
        '^.+\\.ts$': 'ts-jest'
    }
};
