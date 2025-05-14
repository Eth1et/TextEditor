# TextEditor

## Backend:
open a terminal

### Start Database:
Start docker on your system, then

linux:
```
cd backend && docker compose build && docker compose up -d
```

windows:
```
cd backend ; docker compose build ; docker compose up -d
```
### Start Backend Logic
Make sure to be in backend folder

linux:
```
npm i && npm run dev
```

windows:
```
npm i; npm run dev
```

## Fronted:
Open a second terminal
Make sure to be in frontend folder

linux:
```
npm i && ng serve
```

windows:
```
npm i; ng serve
```

## Trying Out:
There are 3 test users in the DB by default, all have the same "mypass" password:

1. "guy@mail.com"
   - is the creator of the publicly readable 'Köszöntő' document
   - is the creator of the publicly editable 'Anarchy' document
   - is the creator of an organization
   - has created a document only editable by the organization members
3. "newguy@mail.com"
   - member of "guy@mail.com"'s organization
   - has only limited access to other docs
5. "verynew@mail.com"
   - only has access to publicly available stuff

### Core Mechanics:
**Document Access**:  there are 4 ways to gain access to a document
1. you are the **creator**, means you have unlimited access to modify who has what kind of access, you are the only one that can delete it
2. you can set **access overrides**, these have the highest priority, you can provide singular users the access to edit, view, or ban them from seeing it, overrides any other access
3. you can share the document with your **organization** and set the **access level** 
4. you can also make a document **publicly available** for editing or viewing

**Organization**:
1. each organization has a creator, only whom can delete it 
2. you can set members to be amdin, who can add or remove or modify memberships
3. you can see the members, and who they were added by

**Editing**:
1. You can edit text with ngx-editor
2. save results
3. each document has a title that you cannot change, it only appears at the document searching page, the inner title is different

**Profile**:
1. delete account
2. update password
