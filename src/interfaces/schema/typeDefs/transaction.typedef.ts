import gql from 'graphql-tag';

const transactionTypeDefs = gql`
	extend type Query {
		transactions: [Transaction!]! @auth(permissions: ["public"])
	}

	extend type Mutation {
		createTransaction(input: CreateTransactionInput!): Transaction!
	}

	type Transaction {
		id: ID!
		amount: Float!
		date: DateTime!
		description: String
	}

	input CreateTransactionInput {
		amount: Float!
		date: DateTime!
		description: String
	}
`;

export default transactionTypeDefs;
