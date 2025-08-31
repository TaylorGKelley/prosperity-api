import { Accounts } from '@/application/useCases/Accounts.useCase';
import { type ContextType } from '@/infrastructure/configuration/apollo';
import { type Resolvers } from '@/types/schema';

const accountResolver: Resolvers<ContextType> = {
	Query: {
		accounts: async (_parent, _args, { req }, _info) => {
			return await Accounts.forUser(req.user).getAll();
		},
		account: async (_parent, { id }, { req }, _info) => {
			const account = await Accounts.forUser(req.user).get({ id })!;

			if (!account) throw new Error('Cannot find a account with that Id');

			return account;
		},
	},
	Mutation: {
		createAccount: async (_parent, { input }, { req }, _info) => {
			return await Accounts.forUser(req.user).create({ input });
		},
		deleteAccount: async (_parent, { id }, { req }, _info) => {
			return Accounts.forUser(req.user).delete({ id });
		},
	},
};

export default accountResolver;
