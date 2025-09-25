import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  Date: { input: Date; output: Date; }
  DateTime: { input: Date; output: Date; }
};

export type Account = {
  __typename?: 'Account';
  budgetId: Scalars['ID']['output'];
  currency: Scalars['String']['output'];
  enrollmentId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  institution: Institution;
  lastFour: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  status: StatusEnum;
  subtype: SubtypeEnum;
  type: TypeEnum;
};

export type Budget = {
  __typename?: 'Budget';
  id: Scalars['ID']['output'];
};

export type Category = {
  __typename?: 'Category';
  amount: Scalars['Float']['output'];
  budgetId: Scalars['ID']['output'];
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  startDate: Scalars['DateTime']['output'];
  totalSpent?: Maybe<Scalars['Float']['output']>;
};

export type CreateAccountInput = {
  accessToken: Scalars['String']['input'];
};

export type CreateCategoryInput = {
  amount: Scalars['Float']['input'];
  name: Scalars['String']['input'];
};

export type CreateSavingGoalInput = {
  budgetId: Scalars['ID']['input'];
  contributionAmount: Scalars['Float']['input'];
  prioritized: Scalars['Boolean']['input'];
  targetAmount: Scalars['Float']['input'];
  title: Scalars['String']['input'];
};

export type CursorPaginationInput = {
  count: Scalars['Int']['input'];
  cursor?: InputMaybe<Scalars['String']['input']>;
};

export type Institution = {
  __typename?: 'Institution';
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createAccount: Array<Account>;
  createBudget: Budget;
  createCategory: Category;
  createSavingGoal: SavingGoal;
  deleteAccount?: Maybe<Scalars['ID']['output']>;
  deleteCategory: Scalars['ID']['output'];
  deleteSavingGoal: Scalars['ID']['output'];
  deleteTransaction: Scalars['ID']['output'];
  syncTransactions: SyncTransactions;
  updateCategory: Category;
  updateSavingGoal: SavingGoal;
};


export type MutationCreateAccountArgs = {
  input: CreateAccountInput;
};


export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};


export type MutationCreateSavingGoalArgs = {
  input: CreateSavingGoalInput;
};


export type MutationDeleteAccountArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteSavingGoalArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteTransactionArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateCategoryArgs = {
  input: UpdateCategoryInput;
};


export type MutationUpdateSavingGoalArgs = {
  input: UpdateSavingGoalInput;
};

export type PageInformation = {
  __typename?: 'PageInformation';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  length: Scalars['Int']['output'];
};

export type PaginatedTransaction = {
  __typename?: 'PaginatedTransaction';
  items: Array<Transaction>;
  pageInfo?: Maybe<PageInformation>;
};

export type Query = {
  __typename?: 'Query';
  account: Account;
  accounts: Array<Account>;
  budget?: Maybe<Budget>;
  categories: Array<Category>;
  category: Category;
  savingGoal?: Maybe<SavingGoal>;
  savingGoals: Array<SavingGoal>;
  transaction: Transaction;
  transactions: PaginatedTransaction;
};


export type QueryAccountArgs = {
  id: Scalars['String']['input'];
};


export type QueryCategoriesArgs = {
  monthDate: Scalars['DateTime']['input'];
};


export type QueryCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySavingGoalArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySavingGoalsArgs = {
  budgetId: Scalars['ID']['input'];
};


export type QueryTransactionArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTransactionsArgs = {
  monthDate: Scalars['DateTime']['input'];
  pagination?: InputMaybe<CursorPaginationInput>;
};

export type SavingGoal = {
  __typename?: 'SavingGoal';
  budget: Budget;
  contributionAmount: Scalars['Float']['output'];
  currentAmount: Scalars['Float']['output'];
  id: Scalars['ID']['output'];
  lastContribution: Scalars['DateTime']['output'];
  prioritized: Scalars['Boolean']['output'];
  targetAmount: Scalars['Float']['output'];
  title: Scalars['String']['output'];
};

export enum StatusEnum {
  Closed = 'CLOSED',
  Open = 'OPEN'
}

export enum SubtypeEnum {
  CertificateOfDeposit = 'CERTIFICATE_OF_DEPOSIT',
  Checking = 'CHECKING',
  CreditCard = 'CREDIT_CARD',
  MoneyMarket = 'MONEY_MARKET',
  Savings = 'SAVINGS',
  Sweep = 'SWEEP',
  Treasury = 'TREASURY'
}

export enum SyncStatusEnum {
  Error = 'ERROR',
  Success = 'SUCCESS'
}

export type SyncTransactions = {
  __typename?: 'SyncTransactions';
  error?: Maybe<Scalars['String']['output']>;
  status: SyncStatusEnum;
};

export type Transaction = {
  __typename?: 'Transaction';
  accountId: Scalars['ID']['output'];
  amount: Scalars['Float']['output'];
  categoryId?: Maybe<Scalars['ID']['output']>;
  date: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  status: TransactionStatusEnum;
  tellerId: Scalars['ID']['output'];
  type: Scalars['String']['output'];
};

export enum TransactionStatusEnum {
  Pending = 'PENDING',
  Posted = 'POSTED'
}

export enum TypeEnum {
  Credit = 'CREDIT',
  Depository = 'DEPOSITORY'
}

export type UpdateCategoryInput = {
  amount?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateSavingGoalInput = {
  contributionAmount?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  prioritized?: InputMaybe<Scalars['Boolean']['input']>;
  targetAmount?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Account: ResolverTypeWrapper<Account>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Budget: ResolverTypeWrapper<Budget>;
  Category: ResolverTypeWrapper<Category>;
  CreateAccountInput: CreateAccountInput;
  CreateCategoryInput: CreateCategoryInput;
  CreateSavingGoalInput: CreateSavingGoalInput;
  CursorPaginationInput: CursorPaginationInput;
  Date: ResolverTypeWrapper<Scalars['Date']['output']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Institution: ResolverTypeWrapper<Institution>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Mutation: ResolverTypeWrapper<{}>;
  PageInformation: ResolverTypeWrapper<PageInformation>;
  PaginatedTransaction: ResolverTypeWrapper<PaginatedTransaction>;
  Query: ResolverTypeWrapper<{}>;
  SavingGoal: ResolverTypeWrapper<SavingGoal>;
  StatusEnum: StatusEnum;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SubtypeEnum: SubtypeEnum;
  SyncStatusEnum: SyncStatusEnum;
  SyncTransactions: ResolverTypeWrapper<SyncTransactions>;
  Transaction: ResolverTypeWrapper<Transaction>;
  TransactionStatusEnum: TransactionStatusEnum;
  TypeEnum: TypeEnum;
  UpdateCategoryInput: UpdateCategoryInput;
  UpdateSavingGoalInput: UpdateSavingGoalInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Account: Account;
  Boolean: Scalars['Boolean']['output'];
  Budget: Budget;
  Category: Category;
  CreateAccountInput: CreateAccountInput;
  CreateCategoryInput: CreateCategoryInput;
  CreateSavingGoalInput: CreateSavingGoalInput;
  CursorPaginationInput: CursorPaginationInput;
  Date: Scalars['Date']['output'];
  DateTime: Scalars['DateTime']['output'];
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  Institution: Institution;
  Int: Scalars['Int']['output'];
  Mutation: {};
  PageInformation: PageInformation;
  PaginatedTransaction: PaginatedTransaction;
  Query: {};
  SavingGoal: SavingGoal;
  String: Scalars['String']['output'];
  SyncTransactions: SyncTransactions;
  Transaction: Transaction;
  UpdateCategoryInput: UpdateCategoryInput;
  UpdateSavingGoalInput: UpdateSavingGoalInput;
};

export type AccountResolvers<ContextType = any, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']> = {
  budgetId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  currency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  enrollmentId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  institution?: Resolver<ResolversTypes['Institution'], ParentType, ContextType>;
  lastFour?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['StatusEnum'], ParentType, ContextType>;
  subtype?: Resolver<ResolversTypes['SubtypeEnum'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TypeEnum'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BudgetResolvers<ContextType = any, ParentType extends ResolversParentTypes['Budget'] = ResolversParentTypes['Budget']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  budgetId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  endDate?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startDate?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  totalSpent?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Date'], any> {
  name: 'Date';
}

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type InstitutionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Institution'] = ResolversParentTypes['Institution']> = {
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createAccount?: Resolver<Array<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<MutationCreateAccountArgs, 'input'>>;
  createBudget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType>;
  createCategory?: Resolver<ResolversTypes['Category'], ParentType, ContextType, RequireFields<MutationCreateCategoryArgs, 'input'>>;
  createSavingGoal?: Resolver<ResolversTypes['SavingGoal'], ParentType, ContextType, RequireFields<MutationCreateSavingGoalArgs, 'input'>>;
  deleteAccount?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType, RequireFields<MutationDeleteAccountArgs, 'id'>>;
  deleteCategory?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationDeleteCategoryArgs, 'id'>>;
  deleteSavingGoal?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationDeleteSavingGoalArgs, 'id'>>;
  deleteTransaction?: Resolver<ResolversTypes['ID'], ParentType, ContextType, RequireFields<MutationDeleteTransactionArgs, 'id'>>;
  syncTransactions?: Resolver<ResolversTypes['SyncTransactions'], ParentType, ContextType>;
  updateCategory?: Resolver<ResolversTypes['Category'], ParentType, ContextType, RequireFields<MutationUpdateCategoryArgs, 'input'>>;
  updateSavingGoal?: Resolver<ResolversTypes['SavingGoal'], ParentType, ContextType, RequireFields<MutationUpdateSavingGoalArgs, 'input'>>;
};

export type PageInformationResolvers<ContextType = any, ParentType extends ResolversParentTypes['PageInformation'] = ResolversParentTypes['PageInformation']> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  length?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PaginatedTransactionResolvers<ContextType = any, ParentType extends ResolversParentTypes['PaginatedTransaction'] = ResolversParentTypes['PaginatedTransaction']> = {
  items?: Resolver<Array<ResolversTypes['Transaction']>, ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInformation']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  account?: Resolver<ResolversTypes['Account'], ParentType, ContextType, RequireFields<QueryAccountArgs, 'id'>>;
  accounts?: Resolver<Array<ResolversTypes['Account']>, ParentType, ContextType>;
  budget?: Resolver<Maybe<ResolversTypes['Budget']>, ParentType, ContextType>;
  categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType, RequireFields<QueryCategoriesArgs, 'monthDate'>>;
  category?: Resolver<ResolversTypes['Category'], ParentType, ContextType, RequireFields<QueryCategoryArgs, 'id'>>;
  savingGoal?: Resolver<Maybe<ResolversTypes['SavingGoal']>, ParentType, ContextType, RequireFields<QuerySavingGoalArgs, 'id'>>;
  savingGoals?: Resolver<Array<ResolversTypes['SavingGoal']>, ParentType, ContextType, RequireFields<QuerySavingGoalsArgs, 'budgetId'>>;
  transaction?: Resolver<ResolversTypes['Transaction'], ParentType, ContextType, RequireFields<QueryTransactionArgs, 'id'>>;
  transactions?: Resolver<ResolversTypes['PaginatedTransaction'], ParentType, ContextType, RequireFields<QueryTransactionsArgs, 'monthDate'>>;
};

export type SavingGoalResolvers<ContextType = any, ParentType extends ResolversParentTypes['SavingGoal'] = ResolversParentTypes['SavingGoal']> = {
  budget?: Resolver<ResolversTypes['Budget'], ParentType, ContextType>;
  contributionAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  currentAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastContribution?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  prioritized?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  targetAmount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SyncTransactionsResolvers<ContextType = any, ParentType extends ResolversParentTypes['SyncTransactions'] = ResolversParentTypes['SyncTransactions']> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['SyncStatusEnum'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TransactionResolvers<ContextType = any, ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction']> = {
  accountId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  amount?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  categoryId?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['TransactionStatusEnum'], ParentType, ContextType>;
  tellerId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Account?: AccountResolvers<ContextType>;
  Budget?: BudgetResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  Date?: GraphQLScalarType;
  DateTime?: GraphQLScalarType;
  Institution?: InstitutionResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PageInformation?: PageInformationResolvers<ContextType>;
  PaginatedTransaction?: PaginatedTransactionResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SavingGoal?: SavingGoalResolvers<ContextType>;
  SyncTransactions?: SyncTransactionsResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
};

