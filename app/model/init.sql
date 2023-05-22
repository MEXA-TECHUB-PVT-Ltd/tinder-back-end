
CREATE SEQUENCE IF NOT EXISTS my_sequence START 100000;

CREATE TABLE IF NOT EXISTS users (
  user_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
   first_name TEXT  ,
  last_name  TEXT,
  email TEXT ,
  password TEXT,
  profession TEXT ,
  interests TEXT ,
  appreciation_text TEXT ,
  height TEXT ,
  profile_picture TEXT ,
  gender TEXT ,
  date_of_birth TEXT ,
  country TEXT ,
  state TEXT ,
  city TEXT ,
  education TEXT ,
  academic_qualifications TEXT ,
  graduated_university TEXT ,
  smoke_status BOOLEAN DEFAULT false,
  drink_status BOOLEAN DEFAULT false,
  constellation_id INTEGER ,
  annual_income  TEXT,
  children INTEGER,
  bio TEXT,
  longitude FLOAT ,
  latitude FLOAT ,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  profile_boosted BOOLEAN
);

CREATE TABLE IF NOT EXISTS otpStored(
  otp_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY ,
  email  TEXT ,
  otp TEXT 
);

CREATE TABLE IF NOT EXISTS admins(
  admin_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  user_name TEXT,
  password TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  img  TEXT,
  privacy_policy  TEXT ,
  terms_and_conditions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS terms_and_condtions(
  terms_and_condition_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  TEXT TEXT,
  status TEXT DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS privacy_policy(
  privacy_policy_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  TEXT TEXT,
  status TEXT DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS about_us(
  about_us_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  TEXT TEXT,
  status TEXT DEFAULT 'inactive',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS swipes(
  swipe_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  swipe_direction TEXT,
  user_id INTEGER ,
  swiped_user_id INTEGER,
  liked BOOLEAN,
  superLiked BOOLEAN,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts(
  posts_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  user_id INTEGER,
  post_images TEXT [],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chatRoom(
  chat_room_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  user_1_id INTEGER,
  user_2_id INTEGER,
  blockStatus BOOLEAN DEFAULT false,
  blocked_by_id  BOOLEAN DEFAULT false,
  deletedForUser1 BOOLEAN DEFAULT false,
  deletedForUser2  BOOLEAN DEFAULT false,
  pinnedByUser1  BOOLEAN DEFAULT false,
  pinnedByUser2  BOOLEAN DEFAULT false,
  archiveByUser1  BOOLEAN DEFAULT false ,
  archiveByUser2  BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages(
  message_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  chat_room_id  INTEGER,
  message_type  TEXT ,
  message  TEXT ,
  sender_id  INTEGER,
  receiver_id  INTEGER , 
  deletedForSender  BOOLEAN DEFAULT false,
  deletedForReceiver  BOOLEAN DEFAULT false,
  delivered  BOOLEAN DEFAULT false ,
  read  BOOLEAN DEFAULT false ,
  media_type  TEXT ,
  reply_on_message_id  INTEGER ,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS school(
  school_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS relation_type(
  relation_type_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  type TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories(
  category_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY ,
  category_name  TEXT ,
  trash BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interests(
  interest_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY ,
  interest_name  TEXT ,
  trash BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preference_types(
  preference_type_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY ,
  preference_type  TEXT ,
  trash BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS preferences(
  preference_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY ,
  preference_type_id INTEGER,
  preference  TEXT ,
  trash BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reported_users_records(
  reported_users_record_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY ,
  user_id INTEGER,
  reported_by INTEGER ,
  report_reason TEXT,
  trash BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts(
  contact_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY ,
  user_id INTEGER,
  contact_name INTEGER ,
  phone_number TEXT,
  trash BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
