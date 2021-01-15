export const petType = `
    type Pet {
        id: ID
        nickname: String
        species: String
        imageUrl: String
    }

    type SuccessStatus {
        success: Boolean!
    }

    type Query {
        pets: [Pet]
        pet(id: ID!): Pet
    }

    type Mutation {
        addPet(nickname: String!): SuccessStatus
        updatePet(nickname: String!): SuccessStatus
        deletePet(nickname: String!): SuccessStatus
    }
`;
