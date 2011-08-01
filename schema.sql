CREATE TABLE smeagol_state
(
  id INT NOT NULL AUTO_INCREMENT,
  owner INT NOT NULL,
  name VARCHAR(32) NOT NULL,
  date_created DATETIME NOT NULL,
  state TEXT NOT NULL,
  
  INDEX (owner),
  PRIMARY KEY (id)
);


CREATE TABLE smeagol_cache
(
  id VARCHAR(32),
  offset INT,
  count INT,
  data TEXT NOT NULL,
  PRIMARY KEY (id, offset, count)
);
