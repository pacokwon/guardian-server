export const userType = `
    type User {
        id: ID
        nickname: String
    }

    type SuccessStatus {
        success: Boolean!
    }

    type Query {
        users: [User]
        user(id: ID!): User
    }

    type Mutation {
        addUser(nickname: String!): SuccessStatus
        updateUser(nickname: String!): SuccessStatus
        deleteUser(nickname: String!): SuccessStatus
    }
`;
