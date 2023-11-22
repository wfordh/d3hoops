import sqlalchemy as _sql
import sqlalchemy.ext.declarative as _declarative
import sqlalchemy.orm as _orm

# move all this stuff to .env file
dbname = "d3hoops"
user = "fordhiggins"
password = None  # don't think I need it locally
port = 5432
host = "localhost"  # don't think I need it locally

cn = f"postgresql://{user}:@{host}:{port}/{dbname}"

engine = _sql.create_engine(cn)
metadata_obj = _sql.MetaData()
# print(f"here is the metadata: {metadata_obj.reflect(engine)}")
# inspector = _sql.inspect(engine)
# schemas = inspector.get_schema_names()
# for schema in schemas:
# 	print(f"schema: {schema}")
# 	for table in inspector.get_table_names(schema=schema):
# 		print(f"table: {table}")
# 	for view in inspector.get_view_names(schema=schema):
# 		print(f"view: {view}")


SessionLocal = _orm.sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = _declarative.declarative_base()