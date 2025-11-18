--Query 1
INSERT INTO public.account (
	account_firstname,
	account_lastname,
	account_email, 
	account_password
)
VALUES (
	'Tony',
	'Stark',
	'tony@starkent.com',
	'Iam1ronM@n'
);

--Query 2
UPDATE account 
SET account_type = 'Admin' 
WHERE account_id = 1;

--Query 3
DELETE 
FROM account 
WHERE account_id = 1;

--Query 4
UPDATE inventory 
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior') 
WHERE inv_id = 10

--Query 5
SELECT i.inv_make,
       i.inv_model,
       c.classification_name
FROM inventory i
INNER JOIN classification c
  ON i.classification_id = c.classification_id
WHERE c.classification_id = 2;

--Query 6
UPDATE inventory
SET inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
    inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');