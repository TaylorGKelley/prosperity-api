import { Categories } from '@/application/useCases/Categories.useCase';
import { type ContextType } from '@/infrastructure/configuration/apollo';
import { type Resolvers } from '@/types/schema';

const categoryResolver: Resolvers<ContextType> = {
	Query: {
		categories: async (_parent, { monthDate, pagination }, { req }, _info) => {
			return await Categories.forUser(req.user).getAll({
				monthDate,
				pagination,
			});
		},
		category: async (_parent, { id }, { req }, _info) => {
			const category = await Categories.forUser(req.user).get({ id })!;

			if (!category) throw new Error('Cannot find a category with that Id');

			return category;
		},
	},
	Mutation: {
		createCategory: async (_parent, { input }, { req }, _info) => {
			return await Categories.forUser(req.user).create({ input });
		},
		updateCategory: async (_parent, { input }, { req }, _info) => {
			return Categories.forUser(req.user).update({ input });
		},
		deleteCategory: async (_parent, { id }, { req }, _info) => {
			return Categories.forUser(req.user).delete({ id });
		},
	},
};

export default categoryResolver;
