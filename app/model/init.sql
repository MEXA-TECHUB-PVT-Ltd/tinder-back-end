
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
  updated_at TIMESTAMP DEFAULT NOW()
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