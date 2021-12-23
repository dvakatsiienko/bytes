import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import { FieldPolicy, FieldReadFunction, TypePolicies, TypePolicy } from '@apollo/client/cache';
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions =  {}
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type AuthenticatedItem = User;

/**  A keystone list  */
export type CartItem = {
  __typename?: 'CartItem';
  id: Scalars['ID'];
  product?: Maybe<Product>;
  quantity?: Maybe<Scalars['Int']>;
  user?: Maybe<User>;
};

export type CartItemCreateInput = {
  product?: Maybe<ProductRelateToOneInput>;
  quantity?: Maybe<Scalars['Int']>;
  user?: Maybe<UserRelateToOneInput>;
};

export type CartItemRelateToManyInput = {
  connect?: Maybe<Array<Maybe<CartItemWhereUniqueInput>>>;
  create?: Maybe<Array<Maybe<CartItemCreateInput>>>;
  disconnect?: Maybe<Array<Maybe<CartItemWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type CartItemUpdateInput = {
  product?: Maybe<ProductRelateToOneInput>;
  quantity?: Maybe<Scalars['Int']>;
  user?: Maybe<UserRelateToOneInput>;
};

export type CartItemWhereInput = {
  AND?: Maybe<Array<Maybe<CartItemWhereInput>>>;
  OR?: Maybe<Array<Maybe<CartItemWhereInput>>>;
  id?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  product?: Maybe<ProductWhereInput>;
  product_is_null?: Maybe<Scalars['Boolean']>;
  quantity?: Maybe<Scalars['Int']>;
  quantity_gt?: Maybe<Scalars['Int']>;
  quantity_gte?: Maybe<Scalars['Int']>;
  quantity_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  quantity_lt?: Maybe<Scalars['Int']>;
  quantity_lte?: Maybe<Scalars['Int']>;
  quantity_not?: Maybe<Scalars['Int']>;
  quantity_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  user?: Maybe<UserWhereInput>;
  user_is_null?: Maybe<Scalars['Boolean']>;
};

export type CartItemWhereUniqueInput = {
  id: Scalars['ID'];
};

export type CartItemsCreateInput = {
  data?: Maybe<CartItemCreateInput>;
};

export type CartItemsUpdateInput = {
  data?: Maybe<CartItemUpdateInput>;
  id: Scalars['ID'];
};

/**
 * Mirrors the formatting options [Cloudinary provides](https://cloudinary.com/documentation/image_transformation_reference).
 * All options are strings as they ultimately end up in a URL.
 */
export type CloudinaryImageFormat = {
  angle?: Maybe<Scalars['String']>;
  aspect_ratio?: Maybe<Scalars['String']>;
  background?: Maybe<Scalars['String']>;
  border?: Maybe<Scalars['String']>;
  color?: Maybe<Scalars['String']>;
  color_space?: Maybe<Scalars['String']>;
  crop?: Maybe<Scalars['String']>;
  default_image?: Maybe<Scalars['String']>;
  delay?: Maybe<Scalars['String']>;
  density?: Maybe<Scalars['String']>;
  dpr?: Maybe<Scalars['String']>;
  effect?: Maybe<Scalars['String']>;
  fetch_format?: Maybe<Scalars['String']>;
  flags?: Maybe<Scalars['String']>;
  format?: Maybe<Scalars['String']>;
  gravity?: Maybe<Scalars['String']>;
  height?: Maybe<Scalars['String']>;
  opacity?: Maybe<Scalars['String']>;
  overlay?: Maybe<Scalars['String']>;
  page?: Maybe<Scalars['String']>;
  /**  Rewrites the filename to be this pretty string. Do not include `/` or `.`  */
  prettyName?: Maybe<Scalars['String']>;
  quality?: Maybe<Scalars['String']>;
  radius?: Maybe<Scalars['String']>;
  transformation?: Maybe<Scalars['String']>;
  underlay?: Maybe<Scalars['String']>;
  width?: Maybe<Scalars['String']>;
  x?: Maybe<Scalars['String']>;
  y?: Maybe<Scalars['String']>;
  zoom?: Maybe<Scalars['String']>;
};

export type CloudinaryImage_File = {
  __typename?: 'CloudinaryImage_File';
  encoding?: Maybe<Scalars['String']>;
  filename?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  mimetype?: Maybe<Scalars['String']>;
  originalFilename?: Maybe<Scalars['String']>;
  path?: Maybe<Scalars['String']>;
  publicUrl?: Maybe<Scalars['String']>;
  publicUrlTransformed?: Maybe<Scalars['String']>;
};


export type CloudinaryImage_FilePublicUrlTransformedArgs = {
  transformation?: Maybe<CloudinaryImageFormat>;
};

export type CreateInitialUserInput = {
  email?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
};

export type KeystoneAdminMeta = {
  __typename?: 'KeystoneAdminMeta';
  enableSessionItem: Scalars['Boolean'];
  enableSignout: Scalars['Boolean'];
  list?: Maybe<KeystoneAdminUiListMeta>;
  lists: Array<KeystoneAdminUiListMeta>;
};


export type KeystoneAdminMetaListArgs = {
  key: Scalars['String'];
};

export type KeystoneAdminUiFieldMeta = {
  __typename?: 'KeystoneAdminUIFieldMeta';
  createView: KeystoneAdminUiFieldMetaCreateView;
  customViewsIndex?: Maybe<Scalars['Int']>;
  fieldMeta?: Maybe<Scalars['JSON']>;
  isOrderable: Scalars['Boolean'];
  itemView?: Maybe<KeystoneAdminUiFieldMetaItemView>;
  label: Scalars['String'];
  listView: KeystoneAdminUiFieldMetaListView;
  path: Scalars['String'];
  viewsIndex: Scalars['Int'];
};


export type KeystoneAdminUiFieldMetaItemViewArgs = {
  id: Scalars['ID'];
};

export type KeystoneAdminUiFieldMetaCreateView = {
  __typename?: 'KeystoneAdminUIFieldMetaCreateView';
  fieldMode: KeystoneAdminUiFieldMetaCreateViewFieldMode;
};

export const KeystoneAdminUiFieldMetaCreateViewFieldMode = {
  Edit: 'edit',
  Hidden: 'hidden'
} as const;

export type KeystoneAdminUiFieldMetaCreateViewFieldMode = typeof KeystoneAdminUiFieldMetaCreateViewFieldMode[keyof typeof KeystoneAdminUiFieldMetaCreateViewFieldMode];
export type KeystoneAdminUiFieldMetaItemView = {
  __typename?: 'KeystoneAdminUIFieldMetaItemView';
  fieldMode: KeystoneAdminUiFieldMetaItemViewFieldMode;
};

export const KeystoneAdminUiFieldMetaItemViewFieldMode = {
  Edit: 'edit',
  Hidden: 'hidden',
  Read: 'read'
} as const;

export type KeystoneAdminUiFieldMetaItemViewFieldMode = typeof KeystoneAdminUiFieldMetaItemViewFieldMode[keyof typeof KeystoneAdminUiFieldMetaItemViewFieldMode];
export type KeystoneAdminUiFieldMetaListView = {
  __typename?: 'KeystoneAdminUIFieldMetaListView';
  fieldMode: KeystoneAdminUiFieldMetaListViewFieldMode;
};

export const KeystoneAdminUiFieldMetaListViewFieldMode = {
  Hidden: 'hidden',
  Read: 'read'
} as const;

export type KeystoneAdminUiFieldMetaListViewFieldMode = typeof KeystoneAdminUiFieldMetaListViewFieldMode[keyof typeof KeystoneAdminUiFieldMetaListViewFieldMode];
export type KeystoneAdminUiListMeta = {
  __typename?: 'KeystoneAdminUIListMeta';
  description?: Maybe<Scalars['String']>;
  fields: Array<KeystoneAdminUiFieldMeta>;
  hideCreate: Scalars['Boolean'];
  hideDelete: Scalars['Boolean'];
  initialColumns: Array<Scalars['String']>;
  initialSort?: Maybe<KeystoneAdminUiSort>;
  isHidden: Scalars['Boolean'];
  itemQueryName: Scalars['String'];
  key: Scalars['String'];
  label: Scalars['String'];
  labelField: Scalars['String'];
  listQueryName: Scalars['String'];
  pageSize: Scalars['Int'];
  path: Scalars['String'];
  plural: Scalars['String'];
  singular: Scalars['String'];
};

export type KeystoneAdminUiSort = {
  __typename?: 'KeystoneAdminUISort';
  direction: KeystoneAdminUiSortDirection;
  field: Scalars['String'];
};

export const KeystoneAdminUiSortDirection = {
  Asc: 'ASC',
  Desc: 'DESC'
} as const;

export type KeystoneAdminUiSortDirection = typeof KeystoneAdminUiSortDirection[keyof typeof KeystoneAdminUiSortDirection];
export type KeystoneMeta = {
  __typename?: 'KeystoneMeta';
  adminMeta: KeystoneAdminMeta;
};

export type Mutation = {
  __typename?: 'Mutation';
  addToCart?: Maybe<CartItem>;
  authenticateUserWithPassword: UserAuthenticationWithPasswordResult;
  checkout?: Maybe<Order>;
  /**  Create a single CartItem item.  */
  createCartItem?: Maybe<CartItem>;
  /**  Create multiple CartItem items.  */
  createCartItems?: Maybe<Array<Maybe<CartItem>>>;
  createInitialUser: UserAuthenticationWithPasswordSuccess;
  /**  Create a single Order item.  */
  createOrder?: Maybe<Order>;
  /**  Create a single OrderItem item.  */
  createOrderItem?: Maybe<OrderItem>;
  /**  Create multiple OrderItem items.  */
  createOrderItems?: Maybe<Array<Maybe<OrderItem>>>;
  /**  Create multiple Order items.  */
  createOrders?: Maybe<Array<Maybe<Order>>>;
  /**  Create a single Product item.  */
  createProduct?: Maybe<Product>;
  /**  Create a single ProductImage item.  */
  createProductImage?: Maybe<ProductImage>;
  /**  Create multiple ProductImage items.  */
  createProductImages?: Maybe<Array<Maybe<ProductImage>>>;
  /**  Create multiple Product items.  */
  createProducts?: Maybe<Array<Maybe<Product>>>;
  /**  Create a single Role item.  */
  createRole?: Maybe<Role>;
  /**  Create multiple Role items.  */
  createRoles?: Maybe<Array<Maybe<Role>>>;
  /**  Create a single User item.  */
  createUser?: Maybe<User>;
  /**  Create multiple User items.  */
  createUsers?: Maybe<Array<Maybe<User>>>;
  /**  Delete a single CartItem item by ID.  */
  deleteCartItem?: Maybe<CartItem>;
  /**  Delete multiple CartItem items by ID.  */
  deleteCartItems?: Maybe<Array<Maybe<CartItem>>>;
  /**  Delete a single Order item by ID.  */
  deleteOrder?: Maybe<Order>;
  /**  Delete a single OrderItem item by ID.  */
  deleteOrderItem?: Maybe<OrderItem>;
  /**  Delete multiple OrderItem items by ID.  */
  deleteOrderItems?: Maybe<Array<Maybe<OrderItem>>>;
  /**  Delete multiple Order items by ID.  */
  deleteOrders?: Maybe<Array<Maybe<Order>>>;
  /**  Delete a single Product item by ID.  */
  deleteProduct?: Maybe<Product>;
  /**  Delete a single ProductImage item by ID.  */
  deleteProductImage?: Maybe<ProductImage>;
  /**  Delete multiple ProductImage items by ID.  */
  deleteProductImages?: Maybe<Array<Maybe<ProductImage>>>;
  /**  Delete multiple Product items by ID.  */
  deleteProducts?: Maybe<Array<Maybe<Product>>>;
  /**  Delete a single Role item by ID.  */
  deleteRole?: Maybe<Role>;
  /**  Delete multiple Role items by ID.  */
  deleteRoles?: Maybe<Array<Maybe<Role>>>;
  /**  Delete a single User item by ID.  */
  deleteUser?: Maybe<User>;
  /**  Delete multiple User items by ID.  */
  deleteUsers?: Maybe<Array<Maybe<User>>>;
  endSession: Scalars['Boolean'];
  redeemUserPasswordResetToken?: Maybe<RedeemUserPasswordResetTokenResult>;
  sendUserPasswordResetLink?: Maybe<SendUserPasswordResetLinkResult>;
  /**  Update a single CartItem item by ID.  */
  updateCartItem?: Maybe<CartItem>;
  /**  Update multiple CartItem items by ID.  */
  updateCartItems?: Maybe<Array<Maybe<CartItem>>>;
  /**  Update a single Order item by ID.  */
  updateOrder?: Maybe<Order>;
  /**  Update a single OrderItem item by ID.  */
  updateOrderItem?: Maybe<OrderItem>;
  /**  Update multiple OrderItem items by ID.  */
  updateOrderItems?: Maybe<Array<Maybe<OrderItem>>>;
  /**  Update multiple Order items by ID.  */
  updateOrders?: Maybe<Array<Maybe<Order>>>;
  /**  Update a single Product item by ID.  */
  updateProduct?: Maybe<Product>;
  /**  Update a single ProductImage item by ID.  */
  updateProductImage?: Maybe<ProductImage>;
  /**  Update multiple ProductImage items by ID.  */
  updateProductImages?: Maybe<Array<Maybe<ProductImage>>>;
  /**  Update multiple Product items by ID.  */
  updateProducts?: Maybe<Array<Maybe<Product>>>;
  /**  Update a single Role item by ID.  */
  updateRole?: Maybe<Role>;
  /**  Update multiple Role items by ID.  */
  updateRoles?: Maybe<Array<Maybe<Role>>>;
  /**  Update a single User item by ID.  */
  updateUser?: Maybe<User>;
  /**  Update multiple User items by ID.  */
  updateUsers?: Maybe<Array<Maybe<User>>>;
};


export type MutationAddToCartArgs = {
  productId?: Maybe<Scalars['ID']>;
};


export type MutationAuthenticateUserWithPasswordArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
};


export type MutationCheckoutArgs = {
  token: Scalars['String'];
};


export type MutationCreateCartItemArgs = {
  data?: Maybe<CartItemCreateInput>;
};


export type MutationCreateCartItemsArgs = {
  data?: Maybe<Array<Maybe<CartItemsCreateInput>>>;
};


export type MutationCreateInitialUserArgs = {
  data: CreateInitialUserInput;
};


export type MutationCreateOrderArgs = {
  data?: Maybe<OrderCreateInput>;
};


export type MutationCreateOrderItemArgs = {
  data?: Maybe<OrderItemCreateInput>;
};


export type MutationCreateOrderItemsArgs = {
  data?: Maybe<Array<Maybe<OrderItemsCreateInput>>>;
};


export type MutationCreateOrdersArgs = {
  data?: Maybe<Array<Maybe<OrdersCreateInput>>>;
};


export type MutationCreateProductArgs = {
  data?: Maybe<ProductCreateInput>;
};


export type MutationCreateProductImageArgs = {
  data?: Maybe<ProductImageCreateInput>;
};


export type MutationCreateProductImagesArgs = {
  data?: Maybe<Array<Maybe<ProductImagesCreateInput>>>;
};


export type MutationCreateProductsArgs = {
  data?: Maybe<Array<Maybe<ProductsCreateInput>>>;
};


export type MutationCreateRoleArgs = {
  data?: Maybe<RoleCreateInput>;
};


export type MutationCreateRolesArgs = {
  data?: Maybe<Array<Maybe<RolesCreateInput>>>;
};


export type MutationCreateUserArgs = {
  data?: Maybe<UserCreateInput>;
};


export type MutationCreateUsersArgs = {
  data?: Maybe<Array<Maybe<UsersCreateInput>>>;
};


export type MutationDeleteCartItemArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteCartItemsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationDeleteOrderArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteOrderItemArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteOrderItemsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationDeleteOrdersArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationDeleteProductArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteProductImageArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteProductImagesArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationDeleteProductsArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationDeleteRoleArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteRolesArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteUsersArgs = {
  ids?: Maybe<Array<Scalars['ID']>>;
};


export type MutationRedeemUserPasswordResetTokenArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  token: Scalars['String'];
};


export type MutationSendUserPasswordResetLinkArgs = {
  email: Scalars['String'];
};


export type MutationUpdateCartItemArgs = {
  data?: Maybe<CartItemUpdateInput>;
  id: Scalars['ID'];
};


export type MutationUpdateCartItemsArgs = {
  data?: Maybe<Array<Maybe<CartItemsUpdateInput>>>;
};


export type MutationUpdateOrderArgs = {
  data?: Maybe<OrderUpdateInput>;
  id: Scalars['ID'];
};


export type MutationUpdateOrderItemArgs = {
  data?: Maybe<OrderItemUpdateInput>;
  id: Scalars['ID'];
};


export type MutationUpdateOrderItemsArgs = {
  data?: Maybe<Array<Maybe<OrderItemsUpdateInput>>>;
};


export type MutationUpdateOrdersArgs = {
  data?: Maybe<Array<Maybe<OrdersUpdateInput>>>;
};


export type MutationUpdateProductArgs = {
  data?: Maybe<ProductUpdateInput>;
  id: Scalars['ID'];
};


export type MutationUpdateProductImageArgs = {
  data?: Maybe<ProductImageUpdateInput>;
  id: Scalars['ID'];
};


export type MutationUpdateProductImagesArgs = {
  data?: Maybe<Array<Maybe<ProductImagesUpdateInput>>>;
};


export type MutationUpdateProductsArgs = {
  data?: Maybe<Array<Maybe<ProductsUpdateInput>>>;
};


export type MutationUpdateRoleArgs = {
  data?: Maybe<RoleUpdateInput>;
  id: Scalars['ID'];
};


export type MutationUpdateRolesArgs = {
  data?: Maybe<Array<Maybe<RolesUpdateInput>>>;
};


export type MutationUpdateUserArgs = {
  data?: Maybe<UserUpdateInput>;
  id: Scalars['ID'];
};


export type MutationUpdateUsersArgs = {
  data?: Maybe<Array<Maybe<UsersUpdateInput>>>;
};

/**  A keystone list  */
export type Order = {
  __typename?: 'Order';
  _itemsMeta?: Maybe<_QueryMeta>;
  charge?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  items: Array<OrderItem>;
  label?: Maybe<Scalars['String']>;
  total?: Maybe<Scalars['Int']>;
  user?: Maybe<User>;
};


/**  A keystone list  */
export type Order_ItemsMetaArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortOrderItemsBy>>;
  where?: Maybe<OrderItemWhereInput>;
};


/**  A keystone list  */
export type OrderItemsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortOrderItemsBy>>;
  where?: Maybe<OrderItemWhereInput>;
};

export type OrderCreateInput = {
  charge?: Maybe<Scalars['String']>;
  items?: Maybe<OrderItemRelateToManyInput>;
  total?: Maybe<Scalars['Int']>;
  user?: Maybe<UserRelateToOneInput>;
};

/**  A keystone list  */
export type OrderItem = {
  __typename?: 'OrderItem';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  order?: Maybe<Order>;
  photo?: Maybe<ProductImage>;
  price?: Maybe<Scalars['Int']>;
  quantity?: Maybe<Scalars['Int']>;
};

export type OrderItemCreateInput = {
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  order?: Maybe<OrderRelateToOneInput>;
  photo?: Maybe<ProductImageRelateToOneInput>;
  price?: Maybe<Scalars['Int']>;
  quantity?: Maybe<Scalars['Int']>;
};

export type OrderItemRelateToManyInput = {
  connect?: Maybe<Array<Maybe<OrderItemWhereUniqueInput>>>;
  create?: Maybe<Array<Maybe<OrderItemCreateInput>>>;
  disconnect?: Maybe<Array<Maybe<OrderItemWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type OrderItemUpdateInput = {
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  order?: Maybe<OrderRelateToOneInput>;
  photo?: Maybe<ProductImageRelateToOneInput>;
  price?: Maybe<Scalars['Int']>;
  quantity?: Maybe<Scalars['Int']>;
};

export type OrderItemWhereInput = {
  AND?: Maybe<Array<Maybe<OrderItemWhereInput>>>;
  OR?: Maybe<Array<Maybe<OrderItemWhereInput>>>;
  description?: Maybe<Scalars['String']>;
  description_contains?: Maybe<Scalars['String']>;
  description_contains_i?: Maybe<Scalars['String']>;
  description_ends_with?: Maybe<Scalars['String']>;
  description_ends_with_i?: Maybe<Scalars['String']>;
  description_i?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  description_not_contains_i?: Maybe<Scalars['String']>;
  description_not_ends_with?: Maybe<Scalars['String']>;
  description_not_ends_with_i?: Maybe<Scalars['String']>;
  description_not_i?: Maybe<Scalars['String']>;
  description_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not_starts_with?: Maybe<Scalars['String']>;
  description_not_starts_with_i?: Maybe<Scalars['String']>;
  description_starts_with?: Maybe<Scalars['String']>;
  description_starts_with_i?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  order?: Maybe<OrderWhereInput>;
  order_is_null?: Maybe<Scalars['Boolean']>;
  photo?: Maybe<ProductImageWhereInput>;
  photo_is_null?: Maybe<Scalars['Boolean']>;
  price?: Maybe<Scalars['Int']>;
  price_gt?: Maybe<Scalars['Int']>;
  price_gte?: Maybe<Scalars['Int']>;
  price_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  price_lt?: Maybe<Scalars['Int']>;
  price_lte?: Maybe<Scalars['Int']>;
  price_not?: Maybe<Scalars['Int']>;
  price_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  quantity?: Maybe<Scalars['Int']>;
  quantity_gt?: Maybe<Scalars['Int']>;
  quantity_gte?: Maybe<Scalars['Int']>;
  quantity_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  quantity_lt?: Maybe<Scalars['Int']>;
  quantity_lte?: Maybe<Scalars['Int']>;
  quantity_not?: Maybe<Scalars['Int']>;
  quantity_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
};

export type OrderItemWhereUniqueInput = {
  id: Scalars['ID'];
};

export type OrderItemsCreateInput = {
  data?: Maybe<OrderItemCreateInput>;
};

export type OrderItemsUpdateInput = {
  data?: Maybe<OrderItemUpdateInput>;
  id: Scalars['ID'];
};

export type OrderRelateToManyInput = {
  connect?: Maybe<Array<Maybe<OrderWhereUniqueInput>>>;
  create?: Maybe<Array<Maybe<OrderCreateInput>>>;
  disconnect?: Maybe<Array<Maybe<OrderWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type OrderRelateToOneInput = {
  connect?: Maybe<OrderWhereUniqueInput>;
  create?: Maybe<OrderCreateInput>;
  disconnect?: Maybe<OrderWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type OrderUpdateInput = {
  charge?: Maybe<Scalars['String']>;
  items?: Maybe<OrderItemRelateToManyInput>;
  total?: Maybe<Scalars['Int']>;
  user?: Maybe<UserRelateToOneInput>;
};

export type OrderWhereInput = {
  AND?: Maybe<Array<Maybe<OrderWhereInput>>>;
  OR?: Maybe<Array<Maybe<OrderWhereInput>>>;
  charge?: Maybe<Scalars['String']>;
  charge_contains?: Maybe<Scalars['String']>;
  charge_contains_i?: Maybe<Scalars['String']>;
  charge_ends_with?: Maybe<Scalars['String']>;
  charge_ends_with_i?: Maybe<Scalars['String']>;
  charge_i?: Maybe<Scalars['String']>;
  charge_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  charge_not?: Maybe<Scalars['String']>;
  charge_not_contains?: Maybe<Scalars['String']>;
  charge_not_contains_i?: Maybe<Scalars['String']>;
  charge_not_ends_with?: Maybe<Scalars['String']>;
  charge_not_ends_with_i?: Maybe<Scalars['String']>;
  charge_not_i?: Maybe<Scalars['String']>;
  charge_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  charge_not_starts_with?: Maybe<Scalars['String']>;
  charge_not_starts_with_i?: Maybe<Scalars['String']>;
  charge_starts_with?: Maybe<Scalars['String']>;
  charge_starts_with_i?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  /**  condition must be true for all nodes  */
  items_every?: Maybe<OrderItemWhereInput>;
  /**  condition must be false for all nodes  */
  items_none?: Maybe<OrderItemWhereInput>;
  /**  condition must be true for at least 1 node  */
  items_some?: Maybe<OrderItemWhereInput>;
  total?: Maybe<Scalars['Int']>;
  total_gt?: Maybe<Scalars['Int']>;
  total_gte?: Maybe<Scalars['Int']>;
  total_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  total_lt?: Maybe<Scalars['Int']>;
  total_lte?: Maybe<Scalars['Int']>;
  total_not?: Maybe<Scalars['Int']>;
  total_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  user?: Maybe<UserWhereInput>;
  user_is_null?: Maybe<Scalars['Boolean']>;
};

export type OrderWhereUniqueInput = {
  id: Scalars['ID'];
};

export type OrdersCreateInput = {
  data?: Maybe<OrderCreateInput>;
};

export type OrdersUpdateInput = {
  data?: Maybe<OrderUpdateInput>;
  id: Scalars['ID'];
};

export const PasswordAuthErrorCode = {
  Failure: 'FAILURE',
  IdentityNotFound: 'IDENTITY_NOT_FOUND',
  MultipleIdentityMatches: 'MULTIPLE_IDENTITY_MATCHES',
  SecretMismatch: 'SECRET_MISMATCH',
  SecretNotSet: 'SECRET_NOT_SET'
} as const;

export type PasswordAuthErrorCode = typeof PasswordAuthErrorCode[keyof typeof PasswordAuthErrorCode];
export const PasswordResetRedemptionErrorCode = {
  Failure: 'FAILURE',
  IdentityNotFound: 'IDENTITY_NOT_FOUND',
  MultipleIdentityMatches: 'MULTIPLE_IDENTITY_MATCHES',
  TokenExpired: 'TOKEN_EXPIRED',
  TokenMismatch: 'TOKEN_MISMATCH',
  TokenNotSet: 'TOKEN_NOT_SET',
  TokenRedeemed: 'TOKEN_REDEEMED'
} as const;

export type PasswordResetRedemptionErrorCode = typeof PasswordResetRedemptionErrorCode[keyof typeof PasswordResetRedemptionErrorCode];
export const PasswordResetRequestErrorCode = {
  IdentityNotFound: 'IDENTITY_NOT_FOUND',
  MultipleIdentityMatches: 'MULTIPLE_IDENTITY_MATCHES'
} as const;

export type PasswordResetRequestErrorCode = typeof PasswordResetRequestErrorCode[keyof typeof PasswordResetRequestErrorCode];
/**  A keystone list  */
export type Product = {
  __typename?: 'Product';
  description?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  photo?: Maybe<ProductImage>;
  price?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
};

export type ProductCreateInput = {
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  photo?: Maybe<ProductImageRelateToOneInput>;
  price?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  user?: Maybe<UserRelateToOneInput>;
};

/**  A keystone list  */
export type ProductImage = {
  __typename?: 'ProductImage';
  altText?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  image?: Maybe<CloudinaryImage_File>;
  product?: Maybe<Product>;
};

export type ProductImageCreateInput = {
  altText?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['Upload']>;
  product?: Maybe<ProductRelateToOneInput>;
};

export type ProductImageRelateToOneInput = {
  connect?: Maybe<ProductImageWhereUniqueInput>;
  create?: Maybe<ProductImageCreateInput>;
  disconnect?: Maybe<ProductImageWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type ProductImageUpdateInput = {
  altText?: Maybe<Scalars['String']>;
  image?: Maybe<Scalars['Upload']>;
  product?: Maybe<ProductRelateToOneInput>;
};

export type ProductImageWhereInput = {
  AND?: Maybe<Array<Maybe<ProductImageWhereInput>>>;
  OR?: Maybe<Array<Maybe<ProductImageWhereInput>>>;
  altText?: Maybe<Scalars['String']>;
  altText_contains?: Maybe<Scalars['String']>;
  altText_contains_i?: Maybe<Scalars['String']>;
  altText_ends_with?: Maybe<Scalars['String']>;
  altText_ends_with_i?: Maybe<Scalars['String']>;
  altText_i?: Maybe<Scalars['String']>;
  altText_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  altText_not?: Maybe<Scalars['String']>;
  altText_not_contains?: Maybe<Scalars['String']>;
  altText_not_contains_i?: Maybe<Scalars['String']>;
  altText_not_ends_with?: Maybe<Scalars['String']>;
  altText_not_ends_with_i?: Maybe<Scalars['String']>;
  altText_not_i?: Maybe<Scalars['String']>;
  altText_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  altText_not_starts_with?: Maybe<Scalars['String']>;
  altText_not_starts_with_i?: Maybe<Scalars['String']>;
  altText_starts_with?: Maybe<Scalars['String']>;
  altText_starts_with_i?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  image?: Maybe<Scalars['String']>;
  image_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  image_not?: Maybe<Scalars['String']>;
  image_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  product?: Maybe<ProductWhereInput>;
  product_is_null?: Maybe<Scalars['Boolean']>;
};

export type ProductImageWhereUniqueInput = {
  id: Scalars['ID'];
};

export type ProductImagesCreateInput = {
  data?: Maybe<ProductImageCreateInput>;
};

export type ProductImagesUpdateInput = {
  data?: Maybe<ProductImageUpdateInput>;
  id: Scalars['ID'];
};

export type ProductRelateToManyInput = {
  connect?: Maybe<Array<Maybe<ProductWhereUniqueInput>>>;
  create?: Maybe<Array<Maybe<ProductCreateInput>>>;
  disconnect?: Maybe<Array<Maybe<ProductWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type ProductRelateToOneInput = {
  connect?: Maybe<ProductWhereUniqueInput>;
  create?: Maybe<ProductCreateInput>;
  disconnect?: Maybe<ProductWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type ProductUpdateInput = {
  description?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  photo?: Maybe<ProductImageRelateToOneInput>;
  price?: Maybe<Scalars['Int']>;
  status?: Maybe<Scalars['String']>;
  user?: Maybe<UserRelateToOneInput>;
};

export type ProductWhereInput = {
  AND?: Maybe<Array<Maybe<ProductWhereInput>>>;
  OR?: Maybe<Array<Maybe<ProductWhereInput>>>;
  description?: Maybe<Scalars['String']>;
  description_contains?: Maybe<Scalars['String']>;
  description_contains_i?: Maybe<Scalars['String']>;
  description_ends_with?: Maybe<Scalars['String']>;
  description_ends_with_i?: Maybe<Scalars['String']>;
  description_i?: Maybe<Scalars['String']>;
  description_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not?: Maybe<Scalars['String']>;
  description_not_contains?: Maybe<Scalars['String']>;
  description_not_contains_i?: Maybe<Scalars['String']>;
  description_not_ends_with?: Maybe<Scalars['String']>;
  description_not_ends_with_i?: Maybe<Scalars['String']>;
  description_not_i?: Maybe<Scalars['String']>;
  description_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  description_not_starts_with?: Maybe<Scalars['String']>;
  description_not_starts_with_i?: Maybe<Scalars['String']>;
  description_starts_with?: Maybe<Scalars['String']>;
  description_starts_with_i?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  photo?: Maybe<ProductImageWhereInput>;
  photo_is_null?: Maybe<Scalars['Boolean']>;
  price?: Maybe<Scalars['Int']>;
  price_gt?: Maybe<Scalars['Int']>;
  price_gte?: Maybe<Scalars['Int']>;
  price_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  price_lt?: Maybe<Scalars['Int']>;
  price_lte?: Maybe<Scalars['Int']>;
  price_not?: Maybe<Scalars['Int']>;
  price_not_in?: Maybe<Array<Maybe<Scalars['Int']>>>;
  status?: Maybe<Scalars['String']>;
  status_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  status_not?: Maybe<Scalars['String']>;
  status_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  user?: Maybe<UserWhereInput>;
  user_is_null?: Maybe<Scalars['Boolean']>;
};

export type ProductWhereUniqueInput = {
  id: Scalars['ID'];
};

export type ProductsCreateInput = {
  data?: Maybe<ProductCreateInput>;
};

export type ProductsUpdateInput = {
  data?: Maybe<ProductUpdateInput>;
  id: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  /**  Search for the CartItem item with the matching ID.  */
  CartItem?: Maybe<CartItem>;
  /**  Search for the Order item with the matching ID.  */
  Order?: Maybe<Order>;
  /**  Search for the OrderItem item with the matching ID.  */
  OrderItem?: Maybe<OrderItem>;
  /**  Search for the Product item with the matching ID.  */
  Product?: Maybe<Product>;
  /**  Search for the ProductImage item with the matching ID.  */
  ProductImage?: Maybe<ProductImage>;
  /**  Search for the Role item with the matching ID.  */
  Role?: Maybe<Role>;
  /**  Search for the User item with the matching ID.  */
  User?: Maybe<User>;
  /**  Retrieve the meta-data for the CartItem list.  */
  _CartItemsMeta?: Maybe<_ListMeta>;
  /**  Retrieve the meta-data for the OrderItem list.  */
  _OrderItemsMeta?: Maybe<_ListMeta>;
  /**  Retrieve the meta-data for the Order list.  */
  _OrdersMeta?: Maybe<_ListMeta>;
  /**  Retrieve the meta-data for the ProductImage list.  */
  _ProductImagesMeta?: Maybe<_ListMeta>;
  /**  Retrieve the meta-data for the Product list.  */
  _ProductsMeta?: Maybe<_ListMeta>;
  /**  Retrieve the meta-data for the Role list.  */
  _RolesMeta?: Maybe<_ListMeta>;
  /**  Retrieve the meta-data for the User list.  */
  _UsersMeta?: Maybe<_ListMeta>;
  /**  Perform a meta-query on all CartItem items which match the where clause.  */
  _allCartItemsMeta?: Maybe<_QueryMeta>;
  /**  Perform a meta-query on all OrderItem items which match the where clause.  */
  _allOrderItemsMeta?: Maybe<_QueryMeta>;
  /**  Perform a meta-query on all Order items which match the where clause.  */
  _allOrdersMeta?: Maybe<_QueryMeta>;
  /**  Perform a meta-query on all ProductImage items which match the where clause.  */
  _allProductImagesMeta?: Maybe<_QueryMeta>;
  /**  Perform a meta-query on all Product items which match the where clause.  */
  _allProductsMeta?: Maybe<_QueryMeta>;
  /**  Perform a meta-query on all Role items which match the where clause.  */
  _allRolesMeta?: Maybe<_QueryMeta>;
  /**  Perform a meta-query on all User items which match the where clause.  */
  _allUsersMeta?: Maybe<_QueryMeta>;
  /**  Retrieve the meta-data for all lists.  */
  _ksListsMeta?: Maybe<Array<Maybe<_ListMeta>>>;
  /**  Search for all CartItem items which match the where clause.  */
  allCartItems?: Maybe<Array<Maybe<CartItem>>>;
  /**  Search for all OrderItem items which match the where clause.  */
  allOrderItems?: Maybe<Array<Maybe<OrderItem>>>;
  /**  Search for all Order items which match the where clause.  */
  allOrders?: Maybe<Array<Maybe<Order>>>;
  /**  Search for all ProductImage items which match the where clause.  */
  allProductImages?: Maybe<Array<Maybe<ProductImage>>>;
  /**  Search for all Product items which match the where clause.  */
  allProducts?: Maybe<Array<Maybe<Product>>>;
  /**  Search for all Role items which match the where clause.  */
  allRoles?: Maybe<Array<Maybe<Role>>>;
  /**  Search for all User items which match the where clause.  */
  allUsers?: Maybe<Array<Maybe<User>>>;
  authenticatedItem?: Maybe<AuthenticatedItem>;
  keystone: KeystoneMeta;
  validateUserPasswordResetToken?: Maybe<ValidateUserPasswordResetTokenResult>;
};


export type QueryCartItemArgs = {
  where: CartItemWhereUniqueInput;
};


export type QueryOrderArgs = {
  where: OrderWhereUniqueInput;
};


export type QueryOrderItemArgs = {
  where: OrderItemWhereUniqueInput;
};


export type QueryProductArgs = {
  where: ProductWhereUniqueInput;
};


export type QueryProductImageArgs = {
  where: ProductImageWhereUniqueInput;
};


export type QueryRoleArgs = {
  where: RoleWhereUniqueInput;
};


export type QueryUserArgs = {
  where: UserWhereUniqueInput;
};


export type Query_AllCartItemsMetaArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortCartItemsBy>>;
  where?: Maybe<CartItemWhereInput>;
};


export type Query_AllOrderItemsMetaArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortOrderItemsBy>>;
  where?: Maybe<OrderItemWhereInput>;
};


export type Query_AllOrdersMetaArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortOrdersBy>>;
  where?: Maybe<OrderWhereInput>;
};


export type Query_AllProductImagesMetaArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortProductImagesBy>>;
  where?: Maybe<ProductImageWhereInput>;
};


export type Query_AllProductsMetaArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortProductsBy>>;
  where?: Maybe<ProductWhereInput>;
};


export type Query_AllRolesMetaArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortRolesBy>>;
  where?: Maybe<RoleWhereInput>;
};


export type Query_AllUsersMetaArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortUsersBy>>;
  where?: Maybe<UserWhereInput>;
};


export type Query_KsListsMetaArgs = {
  where?: Maybe<_KsListsMetaInput>;
};


export type QueryAllCartItemsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortCartItemsBy>>;
  where?: Maybe<CartItemWhereInput>;
};


export type QueryAllOrderItemsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortOrderItemsBy>>;
  where?: Maybe<OrderItemWhereInput>;
};


export type QueryAllOrdersArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortOrdersBy>>;
  where?: Maybe<OrderWhereInput>;
};


export type QueryAllProductImagesArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortProductImagesBy>>;
  where?: Maybe<ProductImageWhereInput>;
};


export type QueryAllProductsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortProductsBy>>;
  where?: Maybe<ProductWhereInput>;
};


export type QueryAllRolesArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortRolesBy>>;
  where?: Maybe<RoleWhereInput>;
};


export type QueryAllUsersArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortUsersBy>>;
  where?: Maybe<UserWhereInput>;
};


export type QueryValidateUserPasswordResetTokenArgs = {
  email: Scalars['String'];
  token: Scalars['String'];
};

export type RedeemUserPasswordResetTokenResult = {
  __typename?: 'RedeemUserPasswordResetTokenResult';
  code: PasswordResetRedemptionErrorCode;
  message: Scalars['String'];
};

/**  A keystone list  */
export type Role = {
  __typename?: 'Role';
  _assignedToMeta?: Maybe<_QueryMeta>;
  assignedTo: Array<User>;
  canManageCart?: Maybe<Scalars['Boolean']>;
  canManageOrders?: Maybe<Scalars['Boolean']>;
  canManageProducts?: Maybe<Scalars['Boolean']>;
  canManageRoles?: Maybe<Scalars['Boolean']>;
  canManageUsers?: Maybe<Scalars['Boolean']>;
  canSeeOtherUsers?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
};


/**  A keystone list  */
export type Role_AssignedToMetaArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortUsersBy>>;
  where?: Maybe<UserWhereInput>;
};


/**  A keystone list  */
export type RoleAssignedToArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortUsersBy>>;
  where?: Maybe<UserWhereInput>;
};

export type RoleCreateInput = {
  assignedTo?: Maybe<UserRelateToManyInput>;
  canManageCart?: Maybe<Scalars['Boolean']>;
  canManageOrders?: Maybe<Scalars['Boolean']>;
  canManageProducts?: Maybe<Scalars['Boolean']>;
  canManageRoles?: Maybe<Scalars['Boolean']>;
  canManageUsers?: Maybe<Scalars['Boolean']>;
  canSeeOtherUsers?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
};

export type RoleRelateToOneInput = {
  connect?: Maybe<RoleWhereUniqueInput>;
  create?: Maybe<RoleCreateInput>;
  disconnect?: Maybe<RoleWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type RoleUpdateInput = {
  assignedTo?: Maybe<UserRelateToManyInput>;
  canManageCart?: Maybe<Scalars['Boolean']>;
  canManageOrders?: Maybe<Scalars['Boolean']>;
  canManageProducts?: Maybe<Scalars['Boolean']>;
  canManageRoles?: Maybe<Scalars['Boolean']>;
  canManageUsers?: Maybe<Scalars['Boolean']>;
  canSeeOtherUsers?: Maybe<Scalars['Boolean']>;
  name?: Maybe<Scalars['String']>;
};

export type RoleWhereInput = {
  AND?: Maybe<Array<Maybe<RoleWhereInput>>>;
  OR?: Maybe<Array<Maybe<RoleWhereInput>>>;
  /**  condition must be true for all nodes  */
  assignedTo_every?: Maybe<UserWhereInput>;
  /**  condition must be false for all nodes  */
  assignedTo_none?: Maybe<UserWhereInput>;
  /**  condition must be true for at least 1 node  */
  assignedTo_some?: Maybe<UserWhereInput>;
  canManageCart?: Maybe<Scalars['Boolean']>;
  canManageCart_not?: Maybe<Scalars['Boolean']>;
  canManageOrders?: Maybe<Scalars['Boolean']>;
  canManageOrders_not?: Maybe<Scalars['Boolean']>;
  canManageProducts?: Maybe<Scalars['Boolean']>;
  canManageProducts_not?: Maybe<Scalars['Boolean']>;
  canManageRoles?: Maybe<Scalars['Boolean']>;
  canManageRoles_not?: Maybe<Scalars['Boolean']>;
  canManageUsers?: Maybe<Scalars['Boolean']>;
  canManageUsers_not?: Maybe<Scalars['Boolean']>;
  canSeeOtherUsers?: Maybe<Scalars['Boolean']>;
  canSeeOtherUsers_not?: Maybe<Scalars['Boolean']>;
  id?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
};

export type RoleWhereUniqueInput = {
  id: Scalars['ID'];
};

export type RolesCreateInput = {
  data?: Maybe<RoleCreateInput>;
};

export type RolesUpdateInput = {
  data?: Maybe<RoleUpdateInput>;
  id: Scalars['ID'];
};

export type SendUserPasswordResetLinkResult = {
  __typename?: 'SendUserPasswordResetLinkResult';
  code: PasswordResetRequestErrorCode;
  message: Scalars['String'];
};

export const SortCartItemsBy = {
  IdAsc: 'id_ASC',
  IdDesc: 'id_DESC',
  ProductAsc: 'product_ASC',
  ProductDesc: 'product_DESC',
  QuantityAsc: 'quantity_ASC',
  QuantityDesc: 'quantity_DESC',
  UserAsc: 'user_ASC',
  UserDesc: 'user_DESC'
} as const;

export type SortCartItemsBy = typeof SortCartItemsBy[keyof typeof SortCartItemsBy];
export const SortOrderItemsBy = {
  DescriptionAsc: 'description_ASC',
  DescriptionDesc: 'description_DESC',
  IdAsc: 'id_ASC',
  IdDesc: 'id_DESC',
  NameAsc: 'name_ASC',
  NameDesc: 'name_DESC',
  OrderAsc: 'order_ASC',
  OrderDesc: 'order_DESC',
  PhotoAsc: 'photo_ASC',
  PhotoDesc: 'photo_DESC',
  PriceAsc: 'price_ASC',
  PriceDesc: 'price_DESC',
  QuantityAsc: 'quantity_ASC',
  QuantityDesc: 'quantity_DESC'
} as const;

export type SortOrderItemsBy = typeof SortOrderItemsBy[keyof typeof SortOrderItemsBy];
export const SortOrdersBy = {
  ChargeAsc: 'charge_ASC',
  ChargeDesc: 'charge_DESC',
  IdAsc: 'id_ASC',
  IdDesc: 'id_DESC',
  ItemsAsc: 'items_ASC',
  ItemsDesc: 'items_DESC',
  TotalAsc: 'total_ASC',
  TotalDesc: 'total_DESC',
  UserAsc: 'user_ASC',
  UserDesc: 'user_DESC'
} as const;

export type SortOrdersBy = typeof SortOrdersBy[keyof typeof SortOrdersBy];
export const SortProductImagesBy = {
  AltTextAsc: 'altText_ASC',
  AltTextDesc: 'altText_DESC',
  IdAsc: 'id_ASC',
  IdDesc: 'id_DESC',
  ProductAsc: 'product_ASC',
  ProductDesc: 'product_DESC'
} as const;

export type SortProductImagesBy = typeof SortProductImagesBy[keyof typeof SortProductImagesBy];
export const SortProductsBy = {
  DescriptionAsc: 'description_ASC',
  DescriptionDesc: 'description_DESC',
  IdAsc: 'id_ASC',
  IdDesc: 'id_DESC',
  NameAsc: 'name_ASC',
  NameDesc: 'name_DESC',
  PhotoAsc: 'photo_ASC',
  PhotoDesc: 'photo_DESC',
  PriceAsc: 'price_ASC',
  PriceDesc: 'price_DESC',
  StatusAsc: 'status_ASC',
  StatusDesc: 'status_DESC',
  UserAsc: 'user_ASC',
  UserDesc: 'user_DESC'
} as const;

export type SortProductsBy = typeof SortProductsBy[keyof typeof SortProductsBy];
export const SortRolesBy = {
  AssignedToAsc: 'assignedTo_ASC',
  AssignedToDesc: 'assignedTo_DESC',
  CanManageCartAsc: 'canManageCart_ASC',
  CanManageCartDesc: 'canManageCart_DESC',
  CanManageOrdersAsc: 'canManageOrders_ASC',
  CanManageOrdersDesc: 'canManageOrders_DESC',
  CanManageProductsAsc: 'canManageProducts_ASC',
  CanManageProductsDesc: 'canManageProducts_DESC',
  CanManageRolesAsc: 'canManageRoles_ASC',
  CanManageRolesDesc: 'canManageRoles_DESC',
  CanManageUsersAsc: 'canManageUsers_ASC',
  CanManageUsersDesc: 'canManageUsers_DESC',
  CanSeeOtherUsersAsc: 'canSeeOtherUsers_ASC',
  CanSeeOtherUsersDesc: 'canSeeOtherUsers_DESC',
  IdAsc: 'id_ASC',
  IdDesc: 'id_DESC',
  NameAsc: 'name_ASC',
  NameDesc: 'name_DESC'
} as const;

export type SortRolesBy = typeof SortRolesBy[keyof typeof SortRolesBy];
export const SortUsersBy = {
  CartAsc: 'cart_ASC',
  CartDesc: 'cart_DESC',
  EmailAsc: 'email_ASC',
  EmailDesc: 'email_DESC',
  IdAsc: 'id_ASC',
  IdDesc: 'id_DESC',
  NameAsc: 'name_ASC',
  NameDesc: 'name_DESC',
  OrdersAsc: 'orders_ASC',
  OrdersDesc: 'orders_DESC',
  PasswordResetIssuedAtAsc: 'passwordResetIssuedAt_ASC',
  PasswordResetIssuedAtDesc: 'passwordResetIssuedAt_DESC',
  PasswordResetRedeemedAtAsc: 'passwordResetRedeemedAt_ASC',
  PasswordResetRedeemedAtDesc: 'passwordResetRedeemedAt_DESC',
  ProductsAsc: 'products_ASC',
  ProductsDesc: 'products_DESC',
  RoleAsc: 'role_ASC',
  RoleDesc: 'role_DESC'
} as const;

export type SortUsersBy = typeof SortUsersBy[keyof typeof SortUsersBy];
/**  A keystone list  */
export type User = {
  __typename?: 'User';
  _cartMeta?: Maybe<_QueryMeta>;
  _ordersMeta?: Maybe<_QueryMeta>;
  _productsMeta?: Maybe<_QueryMeta>;
  cart: Array<CartItem>;
  email?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  orders: Array<Order>;
  passwordResetIssuedAt?: Maybe<Scalars['String']>;
  passwordResetRedeemedAt?: Maybe<Scalars['String']>;
  passwordResetToken_is_set?: Maybe<Scalars['Boolean']>;
  password_is_set?: Maybe<Scalars['Boolean']>;
  products: Array<Product>;
  role?: Maybe<Role>;
};


/**  A keystone list  */
export type User_CartMetaArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortCartItemsBy>>;
  where?: Maybe<CartItemWhereInput>;
};


/**  A keystone list  */
export type User_OrdersMetaArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortOrdersBy>>;
  where?: Maybe<OrderWhereInput>;
};


/**  A keystone list  */
export type User_ProductsMetaArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortProductsBy>>;
  where?: Maybe<ProductWhereInput>;
};


/**  A keystone list  */
export type UserCartArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortCartItemsBy>>;
  where?: Maybe<CartItemWhereInput>;
};


/**  A keystone list  */
export type UserOrdersArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortOrdersBy>>;
  where?: Maybe<OrderWhereInput>;
};


/**  A keystone list  */
export type UserProductsArgs = {
  first?: Maybe<Scalars['Int']>;
  orderBy?: Maybe<Scalars['String']>;
  search?: Maybe<Scalars['String']>;
  skip?: Maybe<Scalars['Int']>;
  sortBy?: Maybe<Array<SortProductsBy>>;
  where?: Maybe<ProductWhereInput>;
};

export type UserAuthenticationWithPasswordFailure = {
  __typename?: 'UserAuthenticationWithPasswordFailure';
  code: PasswordAuthErrorCode;
  message: Scalars['String'];
};

export type UserAuthenticationWithPasswordResult = UserAuthenticationWithPasswordFailure | UserAuthenticationWithPasswordSuccess;

export type UserAuthenticationWithPasswordSuccess = {
  __typename?: 'UserAuthenticationWithPasswordSuccess';
  item: User;
  sessionToken: Scalars['String'];
};

export type UserCreateInput = {
  cart?: Maybe<CartItemRelateToManyInput>;
  email?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  orders?: Maybe<OrderRelateToManyInput>;
  password?: Maybe<Scalars['String']>;
  passwordResetIssuedAt?: Maybe<Scalars['String']>;
  passwordResetRedeemedAt?: Maybe<Scalars['String']>;
  passwordResetToken?: Maybe<Scalars['String']>;
  products?: Maybe<ProductRelateToManyInput>;
  role?: Maybe<RoleRelateToOneInput>;
};

export type UserRelateToManyInput = {
  connect?: Maybe<Array<Maybe<UserWhereUniqueInput>>>;
  create?: Maybe<Array<Maybe<UserCreateInput>>>;
  disconnect?: Maybe<Array<Maybe<UserWhereUniqueInput>>>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type UserRelateToOneInput = {
  connect?: Maybe<UserWhereUniqueInput>;
  create?: Maybe<UserCreateInput>;
  disconnect?: Maybe<UserWhereUniqueInput>;
  disconnectAll?: Maybe<Scalars['Boolean']>;
};

export type UserUpdateInput = {
  cart?: Maybe<CartItemRelateToManyInput>;
  email?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  orders?: Maybe<OrderRelateToManyInput>;
  password?: Maybe<Scalars['String']>;
  passwordResetIssuedAt?: Maybe<Scalars['String']>;
  passwordResetRedeemedAt?: Maybe<Scalars['String']>;
  passwordResetToken?: Maybe<Scalars['String']>;
  products?: Maybe<ProductRelateToManyInput>;
  role?: Maybe<RoleRelateToOneInput>;
};

export type UserWhereInput = {
  AND?: Maybe<Array<Maybe<UserWhereInput>>>;
  OR?: Maybe<Array<Maybe<UserWhereInput>>>;
  /**  condition must be true for all nodes  */
  cart_every?: Maybe<CartItemWhereInput>;
  /**  condition must be false for all nodes  */
  cart_none?: Maybe<CartItemWhereInput>;
  /**  condition must be true for at least 1 node  */
  cart_some?: Maybe<CartItemWhereInput>;
  email?: Maybe<Scalars['String']>;
  email_contains?: Maybe<Scalars['String']>;
  email_contains_i?: Maybe<Scalars['String']>;
  email_ends_with?: Maybe<Scalars['String']>;
  email_ends_with_i?: Maybe<Scalars['String']>;
  email_i?: Maybe<Scalars['String']>;
  email_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  email_not?: Maybe<Scalars['String']>;
  email_not_contains?: Maybe<Scalars['String']>;
  email_not_contains_i?: Maybe<Scalars['String']>;
  email_not_ends_with?: Maybe<Scalars['String']>;
  email_not_ends_with_i?: Maybe<Scalars['String']>;
  email_not_i?: Maybe<Scalars['String']>;
  email_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  email_not_starts_with?: Maybe<Scalars['String']>;
  email_not_starts_with_i?: Maybe<Scalars['String']>;
  email_starts_with?: Maybe<Scalars['String']>;
  email_starts_with_i?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  id_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  id_not?: Maybe<Scalars['ID']>;
  id_not_in?: Maybe<Array<Maybe<Scalars['ID']>>>;
  name?: Maybe<Scalars['String']>;
  name_contains?: Maybe<Scalars['String']>;
  name_contains_i?: Maybe<Scalars['String']>;
  name_ends_with?: Maybe<Scalars['String']>;
  name_ends_with_i?: Maybe<Scalars['String']>;
  name_i?: Maybe<Scalars['String']>;
  name_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not?: Maybe<Scalars['String']>;
  name_not_contains?: Maybe<Scalars['String']>;
  name_not_contains_i?: Maybe<Scalars['String']>;
  name_not_ends_with?: Maybe<Scalars['String']>;
  name_not_ends_with_i?: Maybe<Scalars['String']>;
  name_not_i?: Maybe<Scalars['String']>;
  name_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  name_not_starts_with?: Maybe<Scalars['String']>;
  name_not_starts_with_i?: Maybe<Scalars['String']>;
  name_starts_with?: Maybe<Scalars['String']>;
  name_starts_with_i?: Maybe<Scalars['String']>;
  /**  condition must be true for all nodes  */
  orders_every?: Maybe<OrderWhereInput>;
  /**  condition must be false for all nodes  */
  orders_none?: Maybe<OrderWhereInput>;
  /**  condition must be true for at least 1 node  */
  orders_some?: Maybe<OrderWhereInput>;
  passwordResetIssuedAt?: Maybe<Scalars['String']>;
  passwordResetIssuedAt_gt?: Maybe<Scalars['String']>;
  passwordResetIssuedAt_gte?: Maybe<Scalars['String']>;
  passwordResetIssuedAt_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  passwordResetIssuedAt_lt?: Maybe<Scalars['String']>;
  passwordResetIssuedAt_lte?: Maybe<Scalars['String']>;
  passwordResetIssuedAt_not?: Maybe<Scalars['String']>;
  passwordResetIssuedAt_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  passwordResetRedeemedAt?: Maybe<Scalars['String']>;
  passwordResetRedeemedAt_gt?: Maybe<Scalars['String']>;
  passwordResetRedeemedAt_gte?: Maybe<Scalars['String']>;
  passwordResetRedeemedAt_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  passwordResetRedeemedAt_lt?: Maybe<Scalars['String']>;
  passwordResetRedeemedAt_lte?: Maybe<Scalars['String']>;
  passwordResetRedeemedAt_not?: Maybe<Scalars['String']>;
  passwordResetRedeemedAt_not_in?: Maybe<Array<Maybe<Scalars['String']>>>;
  passwordResetToken_is_set?: Maybe<Scalars['Boolean']>;
  password_is_set?: Maybe<Scalars['Boolean']>;
  /**  condition must be true for all nodes  */
  products_every?: Maybe<ProductWhereInput>;
  /**  condition must be false for all nodes  */
  products_none?: Maybe<ProductWhereInput>;
  /**  condition must be true for at least 1 node  */
  products_some?: Maybe<ProductWhereInput>;
  role?: Maybe<RoleWhereInput>;
  role_is_null?: Maybe<Scalars['Boolean']>;
};

export type UserWhereUniqueInput = {
  id: Scalars['ID'];
};

export type UsersCreateInput = {
  data?: Maybe<UserCreateInput>;
};

export type UsersUpdateInput = {
  data?: Maybe<UserUpdateInput>;
  id: Scalars['ID'];
};

export type ValidateUserPasswordResetTokenResult = {
  __typename?: 'ValidateUserPasswordResetTokenResult';
  code: PasswordResetRedemptionErrorCode;
  message: Scalars['String'];
};

export type _ListAccess = {
  __typename?: '_ListAccess';
  /**
   * Access Control settings for the currently logged in (or anonymous)
   * user when performing 'auth' operations.
   */
  auth?: Maybe<Scalars['JSON']>;
  /**
   * Access Control settings for the currently logged in (or anonymous)
   * user when performing 'create' operations.
   * NOTE: 'create' can only return a Boolean.
   * It is not possible to specify a declarative Where clause for this
   * operation
   */
  create?: Maybe<Scalars['Boolean']>;
  /**
   * Access Control settings for the currently logged in (or anonymous)
   * user when performing 'delete' operations.
   */
  delete?: Maybe<Scalars['JSON']>;
  /**
   * Access Control settings for the currently logged in (or anonymous)
   * user when performing 'read' operations.
   */
  read?: Maybe<Scalars['JSON']>;
  /**
   * Access Control settings for the currently logged in (or anonymous)
   * user when performing 'update' operations.
   */
  update?: Maybe<Scalars['JSON']>;
};

export type _ListInputTypes = {
  __typename?: '_ListInputTypes';
  /** Create mutation input type name */
  createInput?: Maybe<Scalars['String']>;
  /** Create many mutation input type name */
  createManyInput?: Maybe<Scalars['String']>;
  /** Update mutation name input */
  updateInput?: Maybe<Scalars['String']>;
  /** Update many mutation name input */
  updateManyInput?: Maybe<Scalars['String']>;
  /** Input type for matching multiple items */
  whereInput?: Maybe<Scalars['String']>;
  /** Input type for matching a unique item */
  whereUniqueInput?: Maybe<Scalars['String']>;
};

export type _ListMeta = {
  __typename?: '_ListMeta';
  /** Access control configuration for the currently authenticated request */
  access?: Maybe<_ListAccess>;
  /** The list's user-facing description */
  description?: Maybe<Scalars['String']>;
  /** The Keystone list key */
  key?: Maybe<Scalars['String']>;
  /** The list's display name in the Admin UI */
  label?: Maybe<Scalars['String']>;
  /**
   * The Keystone List name
   * @deprecated Use `key` instead
   */
  name?: Maybe<Scalars['String']>;
  /** The list's data path */
  path?: Maybe<Scalars['String']>;
  /** The list's plural display name */
  plural?: Maybe<Scalars['String']>;
  /** Information on the generated GraphQL schema */
  schema?: Maybe<_ListSchema>;
  /** The list's singular display name */
  singular?: Maybe<Scalars['String']>;
};

export type _ListMutations = {
  __typename?: '_ListMutations';
  /** Create mutation name */
  create?: Maybe<Scalars['String']>;
  /** Create many mutation name */
  createMany?: Maybe<Scalars['String']>;
  /** Delete mutation name */
  delete?: Maybe<Scalars['String']>;
  /** Delete many mutation name */
  deleteMany?: Maybe<Scalars['String']>;
  /** Update mutation name */
  update?: Maybe<Scalars['String']>;
  /** Update many mutation name */
  updateMany?: Maybe<Scalars['String']>;
};

export type _ListQueries = {
  __typename?: '_ListQueries';
  /** Single-item query name */
  item?: Maybe<Scalars['String']>;
  /** All-items query name */
  list?: Maybe<Scalars['String']>;
  /** List metadata query name */
  meta?: Maybe<Scalars['String']>;
};

export type _ListSchema = {
  __typename?: '_ListSchema';
  /** Information about fields defined on this list */
  fields?: Maybe<Array<Maybe<_ListSchemaFields>>>;
  /** Top-level GraphQL input types */
  inputTypes?: Maybe<_ListInputTypes>;
  /** Top-level GraphQL mutation names */
  mutations?: Maybe<_ListMutations>;
  /**
   * Top level GraphQL query names which either return this type, or
   * provide aggregate information about this type
   */
  queries?: Maybe<_ListQueries>;
  /**
   * Information about fields on other types which return this type, or
   * provide aggregate information about this type
   */
  relatedFields?: Maybe<Array<Maybe<_ListSchemaRelatedFields>>>;
  /** The typename as used in GraphQL queries */
  type?: Maybe<Scalars['String']>;
};


export type _ListSchemaFieldsArgs = {
  where?: Maybe<_ListSchemaFieldsInput>;
};

export type _ListSchemaFields = {
  __typename?: '_ListSchemaFields';
  /**
   * The name of the field in its list
   * @deprecated Use `path` instead
   */
  name?: Maybe<Scalars['String']>;
  /** The path of the field in its list */
  path?: Maybe<Scalars['String']>;
  /** The field type (ie, Checkbox, Text, etc) */
  type?: Maybe<Scalars['String']>;
};

export type _ListSchemaFieldsInput = {
  type?: Maybe<Scalars['String']>;
};

export type _ListSchemaRelatedFields = {
  __typename?: '_ListSchemaRelatedFields';
  /** A list of GraphQL field names */
  fields?: Maybe<Array<Maybe<Scalars['String']>>>;
  /** The typename as used in GraphQL queries */
  type?: Maybe<Scalars['String']>;
};

export type _QueryMeta = {
  __typename?: '_QueryMeta';
  count?: Maybe<Scalars['Int']>;
};

export type _KsListsMetaInput = {
  /** Whether this is an auxiliary helper list */
  auxiliary?: Maybe<Scalars['Boolean']>;
  key?: Maybe<Scalars['String']>;
};

export type OrderQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type OrderQuery = { __typename?: 'Query', order?: { __typename?: 'Order', id: string, charge?: string | null | undefined, total?: number | null | undefined, user?: { __typename?: 'User', id: string } | null | undefined, items: Array<{ __typename?: 'OrderItem', id: string, name?: string | null | undefined, description?: string | null | undefined, price?: number | null | undefined, quantity?: number | null | undefined, photo?: { __typename?: 'ProductImage', image?: { __typename?: 'CloudinaryImage_File', id?: string | null | undefined, publicUrlTransformed?: string | null | undefined } | null | undefined } | null | undefined }> } | null | undefined };

export type AllOrdersQueryVariables = Exact<{ [key: string]: never; }>;


export type AllOrdersQuery = { __typename?: 'Query', allOrders?: Array<{ __typename?: 'Order', id: string, charge?: string | null | undefined, total?: number | null | undefined, user?: { __typename?: 'User', id: string } | null | undefined, items: Array<{ __typename?: 'OrderItem', id: string, name?: string | null | undefined, description?: string | null | undefined, price?: number | null | undefined, quantity?: number | null | undefined, photo?: { __typename?: 'ProductImage', image?: { __typename?: 'CloudinaryImage_File', id?: string | null | undefined, publicUrlTransformed?: string | null | undefined } | null | undefined } | null | undefined }> } | null | undefined> | null | undefined };

export type CheckoutMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type CheckoutMutation = { __typename?: 'Mutation', checkout?: { __typename?: 'Order', id: string, charge?: string | null | undefined, total?: number | null | undefined, items: Array<{ __typename?: 'OrderItem', id: string, name?: string | null | undefined }> } | null | undefined };

export type OrderFragment = { __typename?: 'Order', id: string, charge?: string | null | undefined, total?: number | null | undefined, user?: { __typename?: 'User', id: string } | null | undefined, items: Array<{ __typename?: 'OrderItem', id: string, name?: string | null | undefined, description?: string | null | undefined, price?: number | null | undefined, quantity?: number | null | undefined, photo?: { __typename?: 'ProductImage', image?: { __typename?: 'CloudinaryImage_File', id?: string | null | undefined, publicUrlTransformed?: string | null | undefined } | null | undefined } | null | undefined }> };

export type AllProductsQueryVariables = Exact<{
  first?: Maybe<Scalars['Int']>;
  skip?: Maybe<Scalars['Int']>;
}>;


export type AllProductsQuery = { __typename?: 'Query', allProducts?: Array<{ __typename?: 'Product', id: string, name?: string | null | undefined, price?: number | null | undefined, description?: string | null | undefined, status?: string | null | undefined, photo?: { __typename?: 'ProductImage', id: string, altText?: string | null | undefined, image?: { __typename?: 'CloudinaryImage_File', publicUrlTransformed?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined> | null | undefined };

export type ProductsCountQueryVariables = Exact<{ [key: string]: never; }>;


export type ProductsCountQuery = { __typename?: 'Query', _allProductsMeta?: { __typename?: '_QueryMeta', count?: number | null | undefined } | null | undefined };

export type ProductQueryVariables = Exact<{
  id: Scalars['ID'];
}>;


export type ProductQuery = { __typename?: 'Query', product?: { __typename?: 'Product', id: string, name?: string | null | undefined, price?: number | null | undefined, description?: string | null | undefined, status?: string | null | undefined, photo?: { __typename?: 'ProductImage', id: string, altText?: string | null | undefined, image?: { __typename?: 'CloudinaryImage_File', publicUrlTransformed?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined };

export type SearchProductsQueryVariables = Exact<{
  searchTerm: Scalars['String'];
}>;


export type SearchProductsQuery = { __typename?: 'Query', searchTerms?: Array<{ __typename?: 'Product', id: string, name?: string | null | undefined, photo?: { __typename?: 'ProductImage', image?: { __typename?: 'CloudinaryImage_File', publicUrlTransformed?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined> | null | undefined };

export type CreateProductMutationVariables = Exact<{
  name: Scalars['String'];
  description: Scalars['String'];
  price: Scalars['Int'];
  image?: Maybe<Scalars['Upload']>;
}>;


export type CreateProductMutation = { __typename?: 'Mutation', createProduct?: { __typename?: 'Product', id: string, name?: string | null | undefined, price?: number | null | undefined, description?: string | null | undefined, status?: string | null | undefined, photo?: { __typename?: 'ProductImage', id: string, altText?: string | null | undefined, image?: { __typename?: 'CloudinaryImage_File', publicUrlTransformed?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined };

export type UpdateProductMutationVariables = Exact<{
  id: Scalars['ID'];
  name: Scalars['String'];
  description: Scalars['String'];
  price: Scalars['Int'];
}>;


export type UpdateProductMutation = { __typename?: 'Mutation', updateProduct?: { __typename?: 'Product', id: string, name?: string | null | undefined, price?: number | null | undefined, description?: string | null | undefined, status?: string | null | undefined, photo?: { __typename?: 'ProductImage', id: string, altText?: string | null | undefined, image?: { __typename?: 'CloudinaryImage_File', publicUrlTransformed?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined };

export type DeleteProductMutationVariables = Exact<{
  id: Scalars['ID'];
}>;


export type DeleteProductMutation = { __typename?: 'Mutation', deleteProduct?: { __typename?: 'Product', id: string, name?: string | null | undefined, price?: number | null | undefined, description?: string | null | undefined, status?: string | null | undefined, photo?: { __typename?: 'ProductImage', id: string, altText?: string | null | undefined, image?: { __typename?: 'CloudinaryImage_File', publicUrlTransformed?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined };

export type AddToCartMutationVariables = Exact<{
  productId: Scalars['ID'];
}>;


export type AddToCartMutation = { __typename?: 'Mutation', addToCart?: { __typename?: 'CartItem', id: string } | null | undefined };

export type RemoveFromCartMutationVariables = Exact<{
  productId: Scalars['ID'];
}>;


export type RemoveFromCartMutation = { __typename?: 'Mutation', deleteCartItem?: { __typename?: 'CartItem', id: string } | null | undefined };

export type ProductFragment = { __typename?: 'Product', id: string, name?: string | null | undefined, price?: number | null | undefined, description?: string | null | undefined, status?: string | null | undefined, photo?: { __typename?: 'ProductImage', id: string, altText?: string | null | undefined, image?: { __typename?: 'CloudinaryImage_File', publicUrlTransformed?: string | null | undefined } | null | undefined } | null | undefined };

export type UserQueryVariables = Exact<{ [key: string]: never; }>;


export type UserQuery = { __typename?: 'Query', authenticatedItem?: { __typename?: 'User', id: string, name?: string | null | undefined, email?: string | null | undefined, cart: Array<{ __typename?: 'CartItem', id: string, quantity?: number | null | undefined, product?: { __typename?: 'Product', id: string, price?: number | null | undefined, name?: string | null | undefined, description?: string | null | undefined, photo?: { __typename?: 'ProductImage', id: string, image?: { __typename?: 'CloudinaryImage_File', id?: string | null | undefined, publicUrlTransformed?: string | null | undefined } | null | undefined } | null | undefined } | null | undefined }> } | null | undefined };

export type LoginMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginMutation = { __typename?: 'Mutation', authenticateUserWithPassword: { __typename?: 'UserAuthenticationWithPasswordFailure', code: PasswordAuthErrorCode, message: string } | { __typename?: 'UserAuthenticationWithPasswordSuccess', sessionToken: string, item: { __typename?: 'User', id: string, name?: string | null | undefined, email?: string | null | undefined } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', endSession: boolean };

export type RegisterMutationVariables = Exact<{
  name: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type RegisterMutation = { __typename?: 'Mutation', createUser?: { __typename?: 'User', id: string, name?: string | null | undefined, email?: string | null | undefined } | null | undefined };

export type RequestPasswordResetMutationVariables = Exact<{
  email: Scalars['String'];
}>;


export type RequestPasswordResetMutation = { __typename?: 'Mutation', sendUserPasswordResetLink?: { __typename?: 'SendUserPasswordResetLinkResult', code: PasswordResetRequestErrorCode, message: string } | null | undefined };

export type ResetPasswordMutationVariables = Exact<{
  email: Scalars['String'];
  password: Scalars['String'];
  token: Scalars['String'];
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', redeemUserPasswordResetToken?: { __typename?: 'RedeemUserPasswordResetTokenResult', code: PasswordResetRedemptionErrorCode, message: string } | null | undefined };

export const OrderFragmentDoc = gql`
    fragment order on Order {
  id
  charge
  total
  user {
    id
  }
  items {
    id
    name
    description
    price
    quantity
    photo {
      image {
        id
        publicUrlTransformed
      }
    }
  }
}
    `;
export const ProductFragmentDoc = gql`
    fragment product on Product {
  id
  name
  price
  description
  status
  photo {
    id
    altText
    image {
      publicUrlTransformed
    }
  }
}
    `;
export const OrderDocument = gql`
    query order($id: ID!) {
  order: Order(where: {id: $id}) {
    ...order
  }
}
    ${OrderFragmentDoc}`;

/**
 * __useOrderQuery__
 *
 * To run a query within a React component, call `useOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrderQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrderQuery(baseOptions: Apollo.QueryHookOptions<OrderQuery, OrderQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<OrderQuery, OrderQueryVariables>(OrderDocument, options);
      }
export function useOrderLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<OrderQuery, OrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<OrderQuery, OrderQueryVariables>(OrderDocument, options);
        }
export type OrderQueryHookResult = ReturnType<typeof useOrderQuery>;
export type OrderLazyQueryHookResult = ReturnType<typeof useOrderLazyQuery>;
export type OrderQueryResult = Apollo.QueryResult<OrderQuery, OrderQueryVariables>;
export const AllOrdersDocument = gql`
    query allOrders {
  allOrders {
    ...order
  }
}
    ${OrderFragmentDoc}`;

/**
 * __useAllOrdersQuery__
 *
 * To run a query within a React component, call `useAllOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllOrdersQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllOrdersQuery(baseOptions?: Apollo.QueryHookOptions<AllOrdersQuery, AllOrdersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllOrdersQuery, AllOrdersQueryVariables>(AllOrdersDocument, options);
      }
export function useAllOrdersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllOrdersQuery, AllOrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllOrdersQuery, AllOrdersQueryVariables>(AllOrdersDocument, options);
        }
export type AllOrdersQueryHookResult = ReturnType<typeof useAllOrdersQuery>;
export type AllOrdersLazyQueryHookResult = ReturnType<typeof useAllOrdersLazyQuery>;
export type AllOrdersQueryResult = Apollo.QueryResult<AllOrdersQuery, AllOrdersQueryVariables>;
export const CheckoutDocument = gql`
    mutation checkout($token: String!) {
  checkout(token: $token) {
    id
    charge
    total
    items {
      id
      name
    }
  }
}
    `;
export type CheckoutMutationFn = Apollo.MutationFunction<CheckoutMutation, CheckoutMutationVariables>;

/**
 * __useCheckoutMutation__
 *
 * To run a mutation, you first call `useCheckoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCheckoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [checkoutMutation, { data, loading, error }] = useCheckoutMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useCheckoutMutation(baseOptions?: Apollo.MutationHookOptions<CheckoutMutation, CheckoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CheckoutMutation, CheckoutMutationVariables>(CheckoutDocument, options);
      }
export type CheckoutMutationHookResult = ReturnType<typeof useCheckoutMutation>;
export type CheckoutMutationResult = Apollo.MutationResult<CheckoutMutation>;
export type CheckoutMutationOptions = Apollo.BaseMutationOptions<CheckoutMutation, CheckoutMutationVariables>;
export const AllProductsDocument = gql`
    query allProducts($first: Int, $skip: Int = 0) {
  allProducts(first: $first, skip: $skip, sortBy: id_DESC) {
    ...product
  }
}
    ${ProductFragmentDoc}`;

/**
 * __useAllProductsQuery__
 *
 * To run a query within a React component, call `useAllProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllProductsQuery({
 *   variables: {
 *      first: // value for 'first'
 *      skip: // value for 'skip'
 *   },
 * });
 */
export function useAllProductsQuery(baseOptions?: Apollo.QueryHookOptions<AllProductsQuery, AllProductsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<AllProductsQuery, AllProductsQueryVariables>(AllProductsDocument, options);
      }
export function useAllProductsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<AllProductsQuery, AllProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<AllProductsQuery, AllProductsQueryVariables>(AllProductsDocument, options);
        }
export type AllProductsQueryHookResult = ReturnType<typeof useAllProductsQuery>;
export type AllProductsLazyQueryHookResult = ReturnType<typeof useAllProductsLazyQuery>;
export type AllProductsQueryResult = Apollo.QueryResult<AllProductsQuery, AllProductsQueryVariables>;
export const ProductsCountDocument = gql`
    query productsCount {
  _allProductsMeta {
    count
  }
}
    `;

/**
 * __useProductsCountQuery__
 *
 * To run a query within a React component, call `useProductsCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductsCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductsCountQuery({
 *   variables: {
 *   },
 * });
 */
export function useProductsCountQuery(baseOptions?: Apollo.QueryHookOptions<ProductsCountQuery, ProductsCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProductsCountQuery, ProductsCountQueryVariables>(ProductsCountDocument, options);
      }
export function useProductsCountLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProductsCountQuery, ProductsCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProductsCountQuery, ProductsCountQueryVariables>(ProductsCountDocument, options);
        }
export type ProductsCountQueryHookResult = ReturnType<typeof useProductsCountQuery>;
export type ProductsCountLazyQueryHookResult = ReturnType<typeof useProductsCountLazyQuery>;
export type ProductsCountQueryResult = Apollo.QueryResult<ProductsCountQuery, ProductsCountQueryVariables>;
export const ProductDocument = gql`
    query product($id: ID!) {
  product: Product(where: {id: $id}) {
    ...product
  }
}
    ${ProductFragmentDoc}`;

/**
 * __useProductQuery__
 *
 * To run a query within a React component, call `useProductQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useProductQuery(baseOptions: Apollo.QueryHookOptions<ProductQuery, ProductQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<ProductQuery, ProductQueryVariables>(ProductDocument, options);
      }
export function useProductLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<ProductQuery, ProductQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<ProductQuery, ProductQueryVariables>(ProductDocument, options);
        }
export type ProductQueryHookResult = ReturnType<typeof useProductQuery>;
export type ProductLazyQueryHookResult = ReturnType<typeof useProductLazyQuery>;
export type ProductQueryResult = Apollo.QueryResult<ProductQuery, ProductQueryVariables>;
export const SearchProductsDocument = gql`
    query searchProducts($searchTerm: String!) {
  searchTerms: allProducts(
    where: {OR: [{name_contains_i: $searchTerm}, {description_contains_i: $searchTerm}]}
  ) {
    id
    name
    photo {
      image {
        publicUrlTransformed
      }
    }
  }
}
    `;

/**
 * __useSearchProductsQuery__
 *
 * To run a query within a React component, call `useSearchProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchProductsQuery({
 *   variables: {
 *      searchTerm: // value for 'searchTerm'
 *   },
 * });
 */
export function useSearchProductsQuery(baseOptions: Apollo.QueryHookOptions<SearchProductsQuery, SearchProductsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchProductsQuery, SearchProductsQueryVariables>(SearchProductsDocument, options);
      }
export function useSearchProductsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchProductsQuery, SearchProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchProductsQuery, SearchProductsQueryVariables>(SearchProductsDocument, options);
        }
export type SearchProductsQueryHookResult = ReturnType<typeof useSearchProductsQuery>;
export type SearchProductsLazyQueryHookResult = ReturnType<typeof useSearchProductsLazyQuery>;
export type SearchProductsQueryResult = Apollo.QueryResult<SearchProductsQuery, SearchProductsQueryVariables>;
export const CreateProductDocument = gql`
    mutation createProduct($name: String!, $description: String!, $price: Int!, $image: Upload) {
  createProduct(
    data: {name: $name, description: $description, price: $price, status: "AVAILABLE", photo: {create: {image: $image, altText: $name}}}
  ) {
    ...product
  }
}
    ${ProductFragmentDoc}`;
export type CreateProductMutationFn = Apollo.MutationFunction<CreateProductMutation, CreateProductMutationVariables>;

/**
 * __useCreateProductMutation__
 *
 * To run a mutation, you first call `useCreateProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProductMutation, { data, loading, error }] = useCreateProductMutation({
 *   variables: {
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      price: // value for 'price'
 *      image: // value for 'image'
 *   },
 * });
 */
export function useCreateProductMutation(baseOptions?: Apollo.MutationHookOptions<CreateProductMutation, CreateProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateProductMutation, CreateProductMutationVariables>(CreateProductDocument, options);
      }
export type CreateProductMutationHookResult = ReturnType<typeof useCreateProductMutation>;
export type CreateProductMutationResult = Apollo.MutationResult<CreateProductMutation>;
export type CreateProductMutationOptions = Apollo.BaseMutationOptions<CreateProductMutation, CreateProductMutationVariables>;
export const UpdateProductDocument = gql`
    mutation updateProduct($id: ID!, $name: String!, $description: String!, $price: Int!) {
  updateProduct(
    id: $id
    data: {name: $name, description: $description, price: $price}
  ) {
    ...product
  }
}
    ${ProductFragmentDoc}`;
export type UpdateProductMutationFn = Apollo.MutationFunction<UpdateProductMutation, UpdateProductMutationVariables>;

/**
 * __useUpdateProductMutation__
 *
 * To run a mutation, you first call `useUpdateProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProductMutation, { data, loading, error }] = useUpdateProductMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      price: // value for 'price'
 *   },
 * });
 */
export function useUpdateProductMutation(baseOptions?: Apollo.MutationHookOptions<UpdateProductMutation, UpdateProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateProductMutation, UpdateProductMutationVariables>(UpdateProductDocument, options);
      }
export type UpdateProductMutationHookResult = ReturnType<typeof useUpdateProductMutation>;
export type UpdateProductMutationResult = Apollo.MutationResult<UpdateProductMutation>;
export type UpdateProductMutationOptions = Apollo.BaseMutationOptions<UpdateProductMutation, UpdateProductMutationVariables>;
export const DeleteProductDocument = gql`
    mutation deleteProduct($id: ID!) {
  deleteProduct(id: $id) {
    ...product
  }
}
    ${ProductFragmentDoc}`;
export type DeleteProductMutationFn = Apollo.MutationFunction<DeleteProductMutation, DeleteProductMutationVariables>;

/**
 * __useDeleteProductMutation__
 *
 * To run a mutation, you first call `useDeleteProductMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteProductMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteProductMutation, { data, loading, error }] = useDeleteProductMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteProductMutation(baseOptions?: Apollo.MutationHookOptions<DeleteProductMutation, DeleteProductMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteProductMutation, DeleteProductMutationVariables>(DeleteProductDocument, options);
      }
export type DeleteProductMutationHookResult = ReturnType<typeof useDeleteProductMutation>;
export type DeleteProductMutationResult = Apollo.MutationResult<DeleteProductMutation>;
export type DeleteProductMutationOptions = Apollo.BaseMutationOptions<DeleteProductMutation, DeleteProductMutationVariables>;
export const AddToCartDocument = gql`
    mutation addToCart($productId: ID!) {
  addToCart(productId: $productId) {
    id
  }
}
    `;
export type AddToCartMutationFn = Apollo.MutationFunction<AddToCartMutation, AddToCartMutationVariables>;

/**
 * __useAddToCartMutation__
 *
 * To run a mutation, you first call `useAddToCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddToCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addToCartMutation, { data, loading, error }] = useAddToCartMutation({
 *   variables: {
 *      productId: // value for 'productId'
 *   },
 * });
 */
export function useAddToCartMutation(baseOptions?: Apollo.MutationHookOptions<AddToCartMutation, AddToCartMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddToCartMutation, AddToCartMutationVariables>(AddToCartDocument, options);
      }
export type AddToCartMutationHookResult = ReturnType<typeof useAddToCartMutation>;
export type AddToCartMutationResult = Apollo.MutationResult<AddToCartMutation>;
export type AddToCartMutationOptions = Apollo.BaseMutationOptions<AddToCartMutation, AddToCartMutationVariables>;
export const RemoveFromCartDocument = gql`
    mutation removeFromCart($productId: ID!) {
  deleteCartItem(id: $productId) {
    id
  }
}
    `;
export type RemoveFromCartMutationFn = Apollo.MutationFunction<RemoveFromCartMutation, RemoveFromCartMutationVariables>;

/**
 * __useRemoveFromCartMutation__
 *
 * To run a mutation, you first call `useRemoveFromCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveFromCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeFromCartMutation, { data, loading, error }] = useRemoveFromCartMutation({
 *   variables: {
 *      productId: // value for 'productId'
 *   },
 * });
 */
export function useRemoveFromCartMutation(baseOptions?: Apollo.MutationHookOptions<RemoveFromCartMutation, RemoveFromCartMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RemoveFromCartMutation, RemoveFromCartMutationVariables>(RemoveFromCartDocument, options);
      }
export type RemoveFromCartMutationHookResult = ReturnType<typeof useRemoveFromCartMutation>;
export type RemoveFromCartMutationResult = Apollo.MutationResult<RemoveFromCartMutation>;
export type RemoveFromCartMutationOptions = Apollo.BaseMutationOptions<RemoveFromCartMutation, RemoveFromCartMutationVariables>;
export const UserDocument = gql`
    query user {
  authenticatedItem {
    ... on User {
      id
      name
      email
      cart {
        id
        quantity
        product {
          id
          price
          name
          description
          photo {
            id
            image {
              id
              publicUrlTransformed
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useUserQuery__
 *
 * To run a query within a React component, call `useUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserQuery(baseOptions?: Apollo.QueryHookOptions<UserQuery, UserQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<UserQuery, UserQueryVariables>(UserDocument, options);
      }
export function useUserLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<UserQuery, UserQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<UserQuery, UserQueryVariables>(UserDocument, options);
        }
export type UserQueryHookResult = ReturnType<typeof useUserQuery>;
export type UserLazyQueryHookResult = ReturnType<typeof useUserLazyQuery>;
export type UserQueryResult = Apollo.QueryResult<UserQuery, UserQueryVariables>;
export const LoginDocument = gql`
    mutation login($email: String!, $password: String!) {
  authenticateUserWithPassword(email: $email, password: $password) {
    ... on UserAuthenticationWithPasswordSuccess {
      item {
        id
        name
        email
      }
      sessionToken
    }
    ... on UserAuthenticationWithPasswordFailure {
      code
      message
    }
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation logout {
  endSession
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const RegisterDocument = gql`
    mutation register($name: String!, $email: String!, $password: String!) {
  createUser(data: {name: $name, email: $email, password: $password}) {
    id
    name
    email
  }
}
    `;
export type RegisterMutationFn = Apollo.MutationFunction<RegisterMutation, RegisterMutationVariables>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      name: // value for 'name'
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useRegisterMutation(baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
      }
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<RegisterMutation, RegisterMutationVariables>;
export const RequestPasswordResetDocument = gql`
    mutation requestPasswordReset($email: String!) {
  sendUserPasswordResetLink(email: $email) {
    code
    message
  }
}
    `;
export type RequestPasswordResetMutationFn = Apollo.MutationFunction<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;

/**
 * __useRequestPasswordResetMutation__
 *
 * To run a mutation, you first call `useRequestPasswordResetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestPasswordResetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestPasswordResetMutation, { data, loading, error }] = useRequestPasswordResetMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useRequestPasswordResetMutation(baseOptions?: Apollo.MutationHookOptions<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>(RequestPasswordResetDocument, options);
      }
export type RequestPasswordResetMutationHookResult = ReturnType<typeof useRequestPasswordResetMutation>;
export type RequestPasswordResetMutationResult = Apollo.MutationResult<RequestPasswordResetMutation>;
export type RequestPasswordResetMutationOptions = Apollo.BaseMutationOptions<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;
export const ResetPasswordDocument = gql`
    mutation resetPassword($email: String!, $password: String!, $token: String!) {
  redeemUserPasswordResetToken(email: $email, password: $password, token: $token) {
    code
    message
  }
}
    `;
export type ResetPasswordMutationFn = Apollo.MutationFunction<ResetPasswordMutation, ResetPasswordMutationVariables>;

/**
 * __useResetPasswordMutation__
 *
 * To run a mutation, you first call `useResetPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordMutation, { data, loading, error }] = useResetPasswordMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      token: // value for 'token'
 *   },
 * });
 */
export function useResetPasswordMutation(baseOptions?: Apollo.MutationHookOptions<ResetPasswordMutation, ResetPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(ResetPasswordDocument, options);
      }
export type ResetPasswordMutationHookResult = ReturnType<typeof useResetPasswordMutation>;
export type ResetPasswordMutationResult = Apollo.MutationResult<ResetPasswordMutation>;
export type ResetPasswordMutationOptions = Apollo.BaseMutationOptions<ResetPasswordMutation, ResetPasswordMutationVariables>;
export type CartItemKeySpecifier = ('id' | 'product' | 'quantity' | 'user' | CartItemKeySpecifier)[];
export type CartItemFieldPolicy = {
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	product?: FieldPolicy<any> | FieldReadFunction<any>,
	quantity?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>
};
export type CloudinaryImage_FileKeySpecifier = ('encoding' | 'filename' | 'id' | 'mimetype' | 'originalFilename' | 'path' | 'publicUrl' | 'publicUrlTransformed' | CloudinaryImage_FileKeySpecifier)[];
export type CloudinaryImage_FileFieldPolicy = {
	encoding?: FieldPolicy<any> | FieldReadFunction<any>,
	filename?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	mimetype?: FieldPolicy<any> | FieldReadFunction<any>,
	originalFilename?: FieldPolicy<any> | FieldReadFunction<any>,
	path?: FieldPolicy<any> | FieldReadFunction<any>,
	publicUrl?: FieldPolicy<any> | FieldReadFunction<any>,
	publicUrlTransformed?: FieldPolicy<any> | FieldReadFunction<any>
};
export type KeystoneAdminMetaKeySpecifier = ('enableSessionItem' | 'enableSignout' | 'list' | 'lists' | KeystoneAdminMetaKeySpecifier)[];
export type KeystoneAdminMetaFieldPolicy = {
	enableSessionItem?: FieldPolicy<any> | FieldReadFunction<any>,
	enableSignout?: FieldPolicy<any> | FieldReadFunction<any>,
	list?: FieldPolicy<any> | FieldReadFunction<any>,
	lists?: FieldPolicy<any> | FieldReadFunction<any>
};
export type KeystoneAdminUIFieldMetaKeySpecifier = ('createView' | 'customViewsIndex' | 'fieldMeta' | 'isOrderable' | 'itemView' | 'label' | 'listView' | 'path' | 'viewsIndex' | KeystoneAdminUIFieldMetaKeySpecifier)[];
export type KeystoneAdminUIFieldMetaFieldPolicy = {
	createView?: FieldPolicy<any> | FieldReadFunction<any>,
	customViewsIndex?: FieldPolicy<any> | FieldReadFunction<any>,
	fieldMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	isOrderable?: FieldPolicy<any> | FieldReadFunction<any>,
	itemView?: FieldPolicy<any> | FieldReadFunction<any>,
	label?: FieldPolicy<any> | FieldReadFunction<any>,
	listView?: FieldPolicy<any> | FieldReadFunction<any>,
	path?: FieldPolicy<any> | FieldReadFunction<any>,
	viewsIndex?: FieldPolicy<any> | FieldReadFunction<any>
};
export type KeystoneAdminUIFieldMetaCreateViewKeySpecifier = ('fieldMode' | KeystoneAdminUIFieldMetaCreateViewKeySpecifier)[];
export type KeystoneAdminUIFieldMetaCreateViewFieldPolicy = {
	fieldMode?: FieldPolicy<any> | FieldReadFunction<any>
};
export type KeystoneAdminUIFieldMetaItemViewKeySpecifier = ('fieldMode' | KeystoneAdminUIFieldMetaItemViewKeySpecifier)[];
export type KeystoneAdminUIFieldMetaItemViewFieldPolicy = {
	fieldMode?: FieldPolicy<any> | FieldReadFunction<any>
};
export type KeystoneAdminUIFieldMetaListViewKeySpecifier = ('fieldMode' | KeystoneAdminUIFieldMetaListViewKeySpecifier)[];
export type KeystoneAdminUIFieldMetaListViewFieldPolicy = {
	fieldMode?: FieldPolicy<any> | FieldReadFunction<any>
};
export type KeystoneAdminUIListMetaKeySpecifier = ('description' | 'fields' | 'hideCreate' | 'hideDelete' | 'initialColumns' | 'initialSort' | 'isHidden' | 'itemQueryName' | 'key' | 'label' | 'labelField' | 'listQueryName' | 'pageSize' | 'path' | 'plural' | 'singular' | KeystoneAdminUIListMetaKeySpecifier)[];
export type KeystoneAdminUIListMetaFieldPolicy = {
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	fields?: FieldPolicy<any> | FieldReadFunction<any>,
	hideCreate?: FieldPolicy<any> | FieldReadFunction<any>,
	hideDelete?: FieldPolicy<any> | FieldReadFunction<any>,
	initialColumns?: FieldPolicy<any> | FieldReadFunction<any>,
	initialSort?: FieldPolicy<any> | FieldReadFunction<any>,
	isHidden?: FieldPolicy<any> | FieldReadFunction<any>,
	itemQueryName?: FieldPolicy<any> | FieldReadFunction<any>,
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	label?: FieldPolicy<any> | FieldReadFunction<any>,
	labelField?: FieldPolicy<any> | FieldReadFunction<any>,
	listQueryName?: FieldPolicy<any> | FieldReadFunction<any>,
	pageSize?: FieldPolicy<any> | FieldReadFunction<any>,
	path?: FieldPolicy<any> | FieldReadFunction<any>,
	plural?: FieldPolicy<any> | FieldReadFunction<any>,
	singular?: FieldPolicy<any> | FieldReadFunction<any>
};
export type KeystoneAdminUISortKeySpecifier = ('direction' | 'field' | KeystoneAdminUISortKeySpecifier)[];
export type KeystoneAdminUISortFieldPolicy = {
	direction?: FieldPolicy<any> | FieldReadFunction<any>,
	field?: FieldPolicy<any> | FieldReadFunction<any>
};
export type KeystoneMetaKeySpecifier = ('adminMeta' | KeystoneMetaKeySpecifier)[];
export type KeystoneMetaFieldPolicy = {
	adminMeta?: FieldPolicy<any> | FieldReadFunction<any>
};
export type MutationKeySpecifier = ('addToCart' | 'authenticateUserWithPassword' | 'checkout' | 'createCartItem' | 'createCartItems' | 'createInitialUser' | 'createOrder' | 'createOrderItem' | 'createOrderItems' | 'createOrders' | 'createProduct' | 'createProductImage' | 'createProductImages' | 'createProducts' | 'createRole' | 'createRoles' | 'createUser' | 'createUsers' | 'deleteCartItem' | 'deleteCartItems' | 'deleteOrder' | 'deleteOrderItem' | 'deleteOrderItems' | 'deleteOrders' | 'deleteProduct' | 'deleteProductImage' | 'deleteProductImages' | 'deleteProducts' | 'deleteRole' | 'deleteRoles' | 'deleteUser' | 'deleteUsers' | 'endSession' | 'redeemUserPasswordResetToken' | 'sendUserPasswordResetLink' | 'updateCartItem' | 'updateCartItems' | 'updateOrder' | 'updateOrderItem' | 'updateOrderItems' | 'updateOrders' | 'updateProduct' | 'updateProductImage' | 'updateProductImages' | 'updateProducts' | 'updateRole' | 'updateRoles' | 'updateUser' | 'updateUsers' | MutationKeySpecifier)[];
export type MutationFieldPolicy = {
	addToCart?: FieldPolicy<any> | FieldReadFunction<any>,
	authenticateUserWithPassword?: FieldPolicy<any> | FieldReadFunction<any>,
	checkout?: FieldPolicy<any> | FieldReadFunction<any>,
	createCartItem?: FieldPolicy<any> | FieldReadFunction<any>,
	createCartItems?: FieldPolicy<any> | FieldReadFunction<any>,
	createInitialUser?: FieldPolicy<any> | FieldReadFunction<any>,
	createOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	createOrderItem?: FieldPolicy<any> | FieldReadFunction<any>,
	createOrderItems?: FieldPolicy<any> | FieldReadFunction<any>,
	createOrders?: FieldPolicy<any> | FieldReadFunction<any>,
	createProduct?: FieldPolicy<any> | FieldReadFunction<any>,
	createProductImage?: FieldPolicy<any> | FieldReadFunction<any>,
	createProductImages?: FieldPolicy<any> | FieldReadFunction<any>,
	createProducts?: FieldPolicy<any> | FieldReadFunction<any>,
	createRole?: FieldPolicy<any> | FieldReadFunction<any>,
	createRoles?: FieldPolicy<any> | FieldReadFunction<any>,
	createUser?: FieldPolicy<any> | FieldReadFunction<any>,
	createUsers?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteCartItem?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteCartItems?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteOrderItem?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteOrderItems?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteOrders?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteProduct?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteProductImage?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteProductImages?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteProducts?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteRole?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteRoles?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteUser?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteUsers?: FieldPolicy<any> | FieldReadFunction<any>,
	endSession?: FieldPolicy<any> | FieldReadFunction<any>,
	redeemUserPasswordResetToken?: FieldPolicy<any> | FieldReadFunction<any>,
	sendUserPasswordResetLink?: FieldPolicy<any> | FieldReadFunction<any>,
	updateCartItem?: FieldPolicy<any> | FieldReadFunction<any>,
	updateCartItems?: FieldPolicy<any> | FieldReadFunction<any>,
	updateOrder?: FieldPolicy<any> | FieldReadFunction<any>,
	updateOrderItem?: FieldPolicy<any> | FieldReadFunction<any>,
	updateOrderItems?: FieldPolicy<any> | FieldReadFunction<any>,
	updateOrders?: FieldPolicy<any> | FieldReadFunction<any>,
	updateProduct?: FieldPolicy<any> | FieldReadFunction<any>,
	updateProductImage?: FieldPolicy<any> | FieldReadFunction<any>,
	updateProductImages?: FieldPolicy<any> | FieldReadFunction<any>,
	updateProducts?: FieldPolicy<any> | FieldReadFunction<any>,
	updateRole?: FieldPolicy<any> | FieldReadFunction<any>,
	updateRoles?: FieldPolicy<any> | FieldReadFunction<any>,
	updateUser?: FieldPolicy<any> | FieldReadFunction<any>,
	updateUsers?: FieldPolicy<any> | FieldReadFunction<any>
};
export type OrderKeySpecifier = ('_itemsMeta' | 'charge' | 'id' | 'items' | 'label' | 'total' | 'user' | OrderKeySpecifier)[];
export type OrderFieldPolicy = {
	_itemsMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	charge?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	items?: FieldPolicy<any> | FieldReadFunction<any>,
	label?: FieldPolicy<any> | FieldReadFunction<any>,
	total?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>
};
export type OrderItemKeySpecifier = ('description' | 'id' | 'name' | 'order' | 'photo' | 'price' | 'quantity' | OrderItemKeySpecifier)[];
export type OrderItemFieldPolicy = {
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	order?: FieldPolicy<any> | FieldReadFunction<any>,
	photo?: FieldPolicy<any> | FieldReadFunction<any>,
	price?: FieldPolicy<any> | FieldReadFunction<any>,
	quantity?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProductKeySpecifier = ('description' | 'id' | 'name' | 'photo' | 'price' | 'status' | 'user' | ProductKeySpecifier)[];
export type ProductFieldPolicy = {
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	photo?: FieldPolicy<any> | FieldReadFunction<any>,
	price?: FieldPolicy<any> | FieldReadFunction<any>,
	status?: FieldPolicy<any> | FieldReadFunction<any>,
	user?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ProductImageKeySpecifier = ('altText' | 'id' | 'image' | 'product' | ProductImageKeySpecifier)[];
export type ProductImageFieldPolicy = {
	altText?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	image?: FieldPolicy<any> | FieldReadFunction<any>,
	product?: FieldPolicy<any> | FieldReadFunction<any>
};
export type QueryKeySpecifier = ('CartItem' | 'Order' | 'OrderItem' | 'Product' | 'ProductImage' | 'Role' | 'User' | '_CartItemsMeta' | '_OrderItemsMeta' | '_OrdersMeta' | '_ProductImagesMeta' | '_ProductsMeta' | '_RolesMeta' | '_UsersMeta' | '_allCartItemsMeta' | '_allOrderItemsMeta' | '_allOrdersMeta' | '_allProductImagesMeta' | '_allProductsMeta' | '_allRolesMeta' | '_allUsersMeta' | '_ksListsMeta' | 'allCartItems' | 'allOrderItems' | 'allOrders' | 'allProductImages' | 'allProducts' | 'allRoles' | 'allUsers' | 'authenticatedItem' | 'keystone' | 'validateUserPasswordResetToken' | QueryKeySpecifier)[];
export type QueryFieldPolicy = {
	CartItem?: FieldPolicy<any> | FieldReadFunction<any>,
	Order?: FieldPolicy<any> | FieldReadFunction<any>,
	OrderItem?: FieldPolicy<any> | FieldReadFunction<any>,
	Product?: FieldPolicy<any> | FieldReadFunction<any>,
	ProductImage?: FieldPolicy<any> | FieldReadFunction<any>,
	Role?: FieldPolicy<any> | FieldReadFunction<any>,
	User?: FieldPolicy<any> | FieldReadFunction<any>,
	_CartItemsMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_OrderItemsMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_OrdersMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_ProductImagesMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_ProductsMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_RolesMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_UsersMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_allCartItemsMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_allOrderItemsMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_allOrdersMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_allProductImagesMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_allProductsMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_allRolesMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_allUsersMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_ksListsMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	allCartItems?: FieldPolicy<any> | FieldReadFunction<any>,
	allOrderItems?: FieldPolicy<any> | FieldReadFunction<any>,
	allOrders?: FieldPolicy<any> | FieldReadFunction<any>,
	allProductImages?: FieldPolicy<any> | FieldReadFunction<any>,
	allProducts?: FieldPolicy<any> | FieldReadFunction<any>,
	allRoles?: FieldPolicy<any> | FieldReadFunction<any>,
	allUsers?: FieldPolicy<any> | FieldReadFunction<any>,
	authenticatedItem?: FieldPolicy<any> | FieldReadFunction<any>,
	keystone?: FieldPolicy<any> | FieldReadFunction<any>,
	validateUserPasswordResetToken?: FieldPolicy<any> | FieldReadFunction<any>
};
export type RedeemUserPasswordResetTokenResultKeySpecifier = ('code' | 'message' | RedeemUserPasswordResetTokenResultKeySpecifier)[];
export type RedeemUserPasswordResetTokenResultFieldPolicy = {
	code?: FieldPolicy<any> | FieldReadFunction<any>,
	message?: FieldPolicy<any> | FieldReadFunction<any>
};
export type RoleKeySpecifier = ('_assignedToMeta' | 'assignedTo' | 'canManageCart' | 'canManageOrders' | 'canManageProducts' | 'canManageRoles' | 'canManageUsers' | 'canSeeOtherUsers' | 'id' | 'name' | RoleKeySpecifier)[];
export type RoleFieldPolicy = {
	_assignedToMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	assignedTo?: FieldPolicy<any> | FieldReadFunction<any>,
	canManageCart?: FieldPolicy<any> | FieldReadFunction<any>,
	canManageOrders?: FieldPolicy<any> | FieldReadFunction<any>,
	canManageProducts?: FieldPolicy<any> | FieldReadFunction<any>,
	canManageRoles?: FieldPolicy<any> | FieldReadFunction<any>,
	canManageUsers?: FieldPolicy<any> | FieldReadFunction<any>,
	canSeeOtherUsers?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>
};
export type SendUserPasswordResetLinkResultKeySpecifier = ('code' | 'message' | SendUserPasswordResetLinkResultKeySpecifier)[];
export type SendUserPasswordResetLinkResultFieldPolicy = {
	code?: FieldPolicy<any> | FieldReadFunction<any>,
	message?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserKeySpecifier = ('_cartMeta' | '_ordersMeta' | '_productsMeta' | 'cart' | 'email' | 'id' | 'name' | 'orders' | 'passwordResetIssuedAt' | 'passwordResetRedeemedAt' | 'passwordResetToken_is_set' | 'password_is_set' | 'products' | 'role' | UserKeySpecifier)[];
export type UserFieldPolicy = {
	_cartMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_ordersMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	_productsMeta?: FieldPolicy<any> | FieldReadFunction<any>,
	cart?: FieldPolicy<any> | FieldReadFunction<any>,
	email?: FieldPolicy<any> | FieldReadFunction<any>,
	id?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	orders?: FieldPolicy<any> | FieldReadFunction<any>,
	passwordResetIssuedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	passwordResetRedeemedAt?: FieldPolicy<any> | FieldReadFunction<any>,
	passwordResetToken_is_set?: FieldPolicy<any> | FieldReadFunction<any>,
	password_is_set?: FieldPolicy<any> | FieldReadFunction<any>,
	products?: FieldPolicy<any> | FieldReadFunction<any>,
	role?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserAuthenticationWithPasswordFailureKeySpecifier = ('code' | 'message' | UserAuthenticationWithPasswordFailureKeySpecifier)[];
export type UserAuthenticationWithPasswordFailureFieldPolicy = {
	code?: FieldPolicy<any> | FieldReadFunction<any>,
	message?: FieldPolicy<any> | FieldReadFunction<any>
};
export type UserAuthenticationWithPasswordSuccessKeySpecifier = ('item' | 'sessionToken' | UserAuthenticationWithPasswordSuccessKeySpecifier)[];
export type UserAuthenticationWithPasswordSuccessFieldPolicy = {
	item?: FieldPolicy<any> | FieldReadFunction<any>,
	sessionToken?: FieldPolicy<any> | FieldReadFunction<any>
};
export type ValidateUserPasswordResetTokenResultKeySpecifier = ('code' | 'message' | ValidateUserPasswordResetTokenResultKeySpecifier)[];
export type ValidateUserPasswordResetTokenResultFieldPolicy = {
	code?: FieldPolicy<any> | FieldReadFunction<any>,
	message?: FieldPolicy<any> | FieldReadFunction<any>
};
export type _ListAccessKeySpecifier = ('auth' | 'create' | 'delete' | 'read' | 'update' | _ListAccessKeySpecifier)[];
export type _ListAccessFieldPolicy = {
	auth?: FieldPolicy<any> | FieldReadFunction<any>,
	create?: FieldPolicy<any> | FieldReadFunction<any>,
	delete?: FieldPolicy<any> | FieldReadFunction<any>,
	read?: FieldPolicy<any> | FieldReadFunction<any>,
	update?: FieldPolicy<any> | FieldReadFunction<any>
};
export type _ListInputTypesKeySpecifier = ('createInput' | 'createManyInput' | 'updateInput' | 'updateManyInput' | 'whereInput' | 'whereUniqueInput' | _ListInputTypesKeySpecifier)[];
export type _ListInputTypesFieldPolicy = {
	createInput?: FieldPolicy<any> | FieldReadFunction<any>,
	createManyInput?: FieldPolicy<any> | FieldReadFunction<any>,
	updateInput?: FieldPolicy<any> | FieldReadFunction<any>,
	updateManyInput?: FieldPolicy<any> | FieldReadFunction<any>,
	whereInput?: FieldPolicy<any> | FieldReadFunction<any>,
	whereUniqueInput?: FieldPolicy<any> | FieldReadFunction<any>
};
export type _ListMetaKeySpecifier = ('access' | 'description' | 'key' | 'label' | 'name' | 'path' | 'plural' | 'schema' | 'singular' | _ListMetaKeySpecifier)[];
export type _ListMetaFieldPolicy = {
	access?: FieldPolicy<any> | FieldReadFunction<any>,
	description?: FieldPolicy<any> | FieldReadFunction<any>,
	key?: FieldPolicy<any> | FieldReadFunction<any>,
	label?: FieldPolicy<any> | FieldReadFunction<any>,
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	path?: FieldPolicy<any> | FieldReadFunction<any>,
	plural?: FieldPolicy<any> | FieldReadFunction<any>,
	schema?: FieldPolicy<any> | FieldReadFunction<any>,
	singular?: FieldPolicy<any> | FieldReadFunction<any>
};
export type _ListMutationsKeySpecifier = ('create' | 'createMany' | 'delete' | 'deleteMany' | 'update' | 'updateMany' | _ListMutationsKeySpecifier)[];
export type _ListMutationsFieldPolicy = {
	create?: FieldPolicy<any> | FieldReadFunction<any>,
	createMany?: FieldPolicy<any> | FieldReadFunction<any>,
	delete?: FieldPolicy<any> | FieldReadFunction<any>,
	deleteMany?: FieldPolicy<any> | FieldReadFunction<any>,
	update?: FieldPolicy<any> | FieldReadFunction<any>,
	updateMany?: FieldPolicy<any> | FieldReadFunction<any>
};
export type _ListQueriesKeySpecifier = ('item' | 'list' | 'meta' | _ListQueriesKeySpecifier)[];
export type _ListQueriesFieldPolicy = {
	item?: FieldPolicy<any> | FieldReadFunction<any>,
	list?: FieldPolicy<any> | FieldReadFunction<any>,
	meta?: FieldPolicy<any> | FieldReadFunction<any>
};
export type _ListSchemaKeySpecifier = ('fields' | 'inputTypes' | 'mutations' | 'queries' | 'relatedFields' | 'type' | _ListSchemaKeySpecifier)[];
export type _ListSchemaFieldPolicy = {
	fields?: FieldPolicy<any> | FieldReadFunction<any>,
	inputTypes?: FieldPolicy<any> | FieldReadFunction<any>,
	mutations?: FieldPolicy<any> | FieldReadFunction<any>,
	queries?: FieldPolicy<any> | FieldReadFunction<any>,
	relatedFields?: FieldPolicy<any> | FieldReadFunction<any>,
	type?: FieldPolicy<any> | FieldReadFunction<any>
};
export type _ListSchemaFieldsKeySpecifier = ('name' | 'path' | 'type' | _ListSchemaFieldsKeySpecifier)[];
export type _ListSchemaFieldsFieldPolicy = {
	name?: FieldPolicy<any> | FieldReadFunction<any>,
	path?: FieldPolicy<any> | FieldReadFunction<any>,
	type?: FieldPolicy<any> | FieldReadFunction<any>
};
export type _ListSchemaRelatedFieldsKeySpecifier = ('fields' | 'type' | _ListSchemaRelatedFieldsKeySpecifier)[];
export type _ListSchemaRelatedFieldsFieldPolicy = {
	fields?: FieldPolicy<any> | FieldReadFunction<any>,
	type?: FieldPolicy<any> | FieldReadFunction<any>
};
export type _QueryMetaKeySpecifier = ('count' | _QueryMetaKeySpecifier)[];
export type _QueryMetaFieldPolicy = {
	count?: FieldPolicy<any> | FieldReadFunction<any>
};
export type StrictTypedTypePolicies = {
	CartItem?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CartItemKeySpecifier | (() => undefined | CartItemKeySpecifier),
		fields?: CartItemFieldPolicy,
	},
	CloudinaryImage_File?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | CloudinaryImage_FileKeySpecifier | (() => undefined | CloudinaryImage_FileKeySpecifier),
		fields?: CloudinaryImage_FileFieldPolicy,
	},
	KeystoneAdminMeta?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | KeystoneAdminMetaKeySpecifier | (() => undefined | KeystoneAdminMetaKeySpecifier),
		fields?: KeystoneAdminMetaFieldPolicy,
	},
	KeystoneAdminUIFieldMeta?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | KeystoneAdminUIFieldMetaKeySpecifier | (() => undefined | KeystoneAdminUIFieldMetaKeySpecifier),
		fields?: KeystoneAdminUIFieldMetaFieldPolicy,
	},
	KeystoneAdminUIFieldMetaCreateView?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | KeystoneAdminUIFieldMetaCreateViewKeySpecifier | (() => undefined | KeystoneAdminUIFieldMetaCreateViewKeySpecifier),
		fields?: KeystoneAdminUIFieldMetaCreateViewFieldPolicy,
	},
	KeystoneAdminUIFieldMetaItemView?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | KeystoneAdminUIFieldMetaItemViewKeySpecifier | (() => undefined | KeystoneAdminUIFieldMetaItemViewKeySpecifier),
		fields?: KeystoneAdminUIFieldMetaItemViewFieldPolicy,
	},
	KeystoneAdminUIFieldMetaListView?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | KeystoneAdminUIFieldMetaListViewKeySpecifier | (() => undefined | KeystoneAdminUIFieldMetaListViewKeySpecifier),
		fields?: KeystoneAdminUIFieldMetaListViewFieldPolicy,
	},
	KeystoneAdminUIListMeta?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | KeystoneAdminUIListMetaKeySpecifier | (() => undefined | KeystoneAdminUIListMetaKeySpecifier),
		fields?: KeystoneAdminUIListMetaFieldPolicy,
	},
	KeystoneAdminUISort?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | KeystoneAdminUISortKeySpecifier | (() => undefined | KeystoneAdminUISortKeySpecifier),
		fields?: KeystoneAdminUISortFieldPolicy,
	},
	KeystoneMeta?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | KeystoneMetaKeySpecifier | (() => undefined | KeystoneMetaKeySpecifier),
		fields?: KeystoneMetaFieldPolicy,
	},
	Mutation?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | MutationKeySpecifier | (() => undefined | MutationKeySpecifier),
		fields?: MutationFieldPolicy,
	},
	Order?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | OrderKeySpecifier | (() => undefined | OrderKeySpecifier),
		fields?: OrderFieldPolicy,
	},
	OrderItem?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | OrderItemKeySpecifier | (() => undefined | OrderItemKeySpecifier),
		fields?: OrderItemFieldPolicy,
	},
	Product?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ProductKeySpecifier | (() => undefined | ProductKeySpecifier),
		fields?: ProductFieldPolicy,
	},
	ProductImage?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ProductImageKeySpecifier | (() => undefined | ProductImageKeySpecifier),
		fields?: ProductImageFieldPolicy,
	},
	Query?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | QueryKeySpecifier | (() => undefined | QueryKeySpecifier),
		fields?: QueryFieldPolicy,
	},
	RedeemUserPasswordResetTokenResult?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | RedeemUserPasswordResetTokenResultKeySpecifier | (() => undefined | RedeemUserPasswordResetTokenResultKeySpecifier),
		fields?: RedeemUserPasswordResetTokenResultFieldPolicy,
	},
	Role?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | RoleKeySpecifier | (() => undefined | RoleKeySpecifier),
		fields?: RoleFieldPolicy,
	},
	SendUserPasswordResetLinkResult?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | SendUserPasswordResetLinkResultKeySpecifier | (() => undefined | SendUserPasswordResetLinkResultKeySpecifier),
		fields?: SendUserPasswordResetLinkResultFieldPolicy,
	},
	User?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserKeySpecifier | (() => undefined | UserKeySpecifier),
		fields?: UserFieldPolicy,
	},
	UserAuthenticationWithPasswordFailure?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserAuthenticationWithPasswordFailureKeySpecifier | (() => undefined | UserAuthenticationWithPasswordFailureKeySpecifier),
		fields?: UserAuthenticationWithPasswordFailureFieldPolicy,
	},
	UserAuthenticationWithPasswordSuccess?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | UserAuthenticationWithPasswordSuccessKeySpecifier | (() => undefined | UserAuthenticationWithPasswordSuccessKeySpecifier),
		fields?: UserAuthenticationWithPasswordSuccessFieldPolicy,
	},
	ValidateUserPasswordResetTokenResult?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | ValidateUserPasswordResetTokenResultKeySpecifier | (() => undefined | ValidateUserPasswordResetTokenResultKeySpecifier),
		fields?: ValidateUserPasswordResetTokenResultFieldPolicy,
	},
	_ListAccess?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | _ListAccessKeySpecifier | (() => undefined | _ListAccessKeySpecifier),
		fields?: _ListAccessFieldPolicy,
	},
	_ListInputTypes?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | _ListInputTypesKeySpecifier | (() => undefined | _ListInputTypesKeySpecifier),
		fields?: _ListInputTypesFieldPolicy,
	},
	_ListMeta?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | _ListMetaKeySpecifier | (() => undefined | _ListMetaKeySpecifier),
		fields?: _ListMetaFieldPolicy,
	},
	_ListMutations?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | _ListMutationsKeySpecifier | (() => undefined | _ListMutationsKeySpecifier),
		fields?: _ListMutationsFieldPolicy,
	},
	_ListQueries?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | _ListQueriesKeySpecifier | (() => undefined | _ListQueriesKeySpecifier),
		fields?: _ListQueriesFieldPolicy,
	},
	_ListSchema?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | _ListSchemaKeySpecifier | (() => undefined | _ListSchemaKeySpecifier),
		fields?: _ListSchemaFieldPolicy,
	},
	_ListSchemaFields?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | _ListSchemaFieldsKeySpecifier | (() => undefined | _ListSchemaFieldsKeySpecifier),
		fields?: _ListSchemaFieldsFieldPolicy,
	},
	_ListSchemaRelatedFields?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | _ListSchemaRelatedFieldsKeySpecifier | (() => undefined | _ListSchemaRelatedFieldsKeySpecifier),
		fields?: _ListSchemaRelatedFieldsFieldPolicy,
	},
	_QueryMeta?: Omit<TypePolicy, "fields" | "keyFields"> & {
		keyFields?: false | _QueryMetaKeySpecifier | (() => undefined | _QueryMetaKeySpecifier),
		fields?: _QueryMetaFieldPolicy,
	}
};
export type TypedTypePolicies = StrictTypedTypePolicies & TypePolicies;