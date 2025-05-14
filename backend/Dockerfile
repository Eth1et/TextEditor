FROM mongo

COPY mongo-dump /dump

RUN mongod --fork --logpath /var/log/mongod.log \
  && mongorestore --db db /dump/db \
  && mongod --shutdown