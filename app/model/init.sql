
CREATE SEQUENCE IF NOT EXISTS my_sequence START 100000;

CREATE TABLE IF NOT EXISTS users (
  user_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY,
  name TEXT  ,
  email TEXT ,
  phone_number TEXT,
  password TEXT,
  dob TEXT,
  relation_type INTEGER,
  school INTEGER,
  interest INTEGER[],
  job_title TEXT ,
  company TEXT,
  category_id TEXT,
  active_status BOOLEAN,
  gender TEXT ,
  bio TEXT,
  images TEXT[],
  preference INT,
  city TEXT,
  country TEXT,
  longitude FLOAT ,
  latitude FLOAT ,
  login_type TEXT,
  insta_id TEXT,
  spotify_id TEXT,
  block_status BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  profile_boosted BOOLEAN,
  last_online_time TIMESTAMPTZ,
  subscribed_status BOOLEAN,
  verified_by_email BOOLEAN DEFAULT false
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
  image TEXT,
  trash BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS interests(
  interest_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY ,
  interest_name  TEXT ,
  category_id INTEGER,
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
  contact_name TEXT ,
  phone_number TEXT,
  block BOOLEAN,
  trash BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications(
  notification_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY ,
  sender INT , 
  receiver INT,
  text TEXT,
  type TEXT,
  read BOOLEAN DEFAULT false,
  trash BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);



CREATE TABLE IF NOT EXISTS schedules_tables(
  schedule_table_id INT NOT NULL DEFAULT nextval('my_sequence') PRIMARY KEY ,
  executeat TEXT , 
  start_at TEXT,
  user_id INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);


