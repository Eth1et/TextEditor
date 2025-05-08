
// Success
export const
    LOGOUT_SUCCESS = "Successfully logged out.",
    LOGIN_SUCCESS = "Successfully logged in.",
    REGISTER_SUCCESS = "Succesfully registered.",
    PASSWORD_UPDATE_SUCCESS = 'Successfully updated your password.',
    ACCOUNT_DELETE_SUCCESS= 'Successfully deleted your account',
    DB_CONNECT_SUCCESS = "Successfully connected to MongoDB.",
    ORG_CREATED_SUCCESS = 'Successfully created organization.',
    ORG_DELETD_SUCESS = 'Successfully deleted organization.',
    ORG_UPDATED_SUCCESS = 'Successfully updated organization.',
    MEMBER_ADD_SUCCESS = 'Successfully added member.',
    MEMBER_REMOVED_SUCCESS = 'Successfully removed member.',
    MEMBER_UPDATE_SUCCESS = 'Successfully updated membership details.',
    DOC_SAVE_SUCCESS = 'Successfully saved document.',
    DOC_DELETE_SUCCESS = 'Succesfully deleted document.',
    ACCESS_OVERRIDE_SUCCESS = 'Successful access override.';


// Error
export const
    INCORRECT_EMAIL_OR_PASSWORD_ERR = 'Incorrect email or password.',
    NOT_LOGGED_IN_ERR = 'You are not logged in.',
    USER_NOT_FOUND_ERR = 'User not found',
    ALREADY_LOGGED_IN_ERR = 'You have already logged in.',
    INTERNAL_ERR = 'Internal server error.',
    TOO_MANY_REQUESTS_ERR = 'Too many requests, please try again later.',
    INVALID_REQUEST_ERR = 'Invalid Request.',
    EMAIL_ALREADY_IN_USE_ERR = 'Email has already been used.',
    SESSION_EXPIRED_ERR = 'Your session is no longer valid. Log in!',
    INCORRECT_PASSWORD_ERR = 'Incorrect Password.',
    PASSWORDS_DONT_MATCH_ERR = 'Passwords do not match.',
    ORG_NAME_TAKEN_ERR = 'Organization name is already taken.',
    USER_NOT_MEMBER_OF_ORG_ERR = 'You are not a member of that organization.',
    NO_ADMIN_PERMISSION_ON_ORG_ERR = 'Prohibited action! You are not an admin of the organization.',
    NO_USER_WITH_GIVEN_EMAIL_ERR = 'There is no user with the given email.',
    USER_ALREADY_MEMBER_ERR = 'The user is already a member of the organization.',
    CANNOT_REMOVE_SELF_ERR = 'You cannot remove yourself from an organization, delete it!',
    CANNOT_UPDATE_SELF_MEMBERSHIP_ERR = 'You cannot change your own membership!',
    NO_SUCH_DOCUMENT_ERR = 'There is no such document, cannot save it!',
    MUST_BE_CREATOR_ERR = 'Only the creator can perform this action!',
    ORG_DOESNT_EXIST_ERR = 'Organization does not exist.',
    INSUFFICIENT_ACCESS_ERR = 'You do not have the permission.',
    ACCESS_OVERRIDE_DOESNT_EXIST_ERR = 'The access ovveride doesn\'exists.',
    ACCESS_OVERRIDE_ALREADY_EXIST_ERR = 'Acess override to this person already exists';