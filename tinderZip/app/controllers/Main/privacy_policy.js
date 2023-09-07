const { pool } = require('../../config/db.config');

// ADDING PRIVACY POLICY TO THE DB

exports.addPrivacyPolicy = async (req, res) => {

    // CONNECTING TO THE DB

    const client = await pool.connect();
    try {

        // DESTRUCTURING DATA FROM THE BODY

        const text = req.body.text;

        // SETTING UP QUERY TO ADD DATA TO DB

        const query = 'INSERT INTO privacy_policy (text) Values ($1) RETURNING *'

        // SAVING DATA INTO THE DATABASE USING QUERY ABOVE

        const result = await pool.query(query, [text]);

        // CHECKING IF THE DATA HAS BEEN SAVED THEN SENDING TRUE STATUS TO THE RESPONSE

        if (result.rows[0]) {
            res.json({
                message: "Created privacy_policy",
                status: true,
                result: result.rows[0]
            })
        }

        // CHECKING IF THE DATA HAS NOT BEEN SAVED THEN SENDING FALSE STATUS TO THE RESPONSE

        else {
            res.json({
                message: "Could not insert record",
                status: false
            })
        }
    }
    catch (err) {

        // EXCEPTION HANDLING

        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
    }

}

// GET ALL PRIVACY POLICIES

exports.getAllPrivacyPlicies = async (req, res) => {

    // CONNECTING TO THE DATABASE
    const client = await pool.connect();

    try {

        // SETTING UP QUERY TO GET ALL DATA FROM DB

        const query = 'SELECT * FROM privacy_policy';

        // FETECHING RESULTS FROM THE DB USING QUERY ABOVE

        const result = await pool.query(query);

        // CHEKCING IF THE DATA HAS BEEN SAVED THEN SENDING STATUS TRUE TO THE RESPONSE

        if (result.rows) {
            res.json({
                message: "All Fetched privacy policies",
                status: true,
                result: result.rows
            })
        }

        // CHEKCING IF THE DATA HAS NOT BEEN SAVED THEN SENDING STATUS FALSE TO THE RESPONSE

        else {
            res.json({
                message: "Could not fetch record",
                status: false
            })
        }

    }
    catch (err) {

        // EXCEPTION HANDLING

        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
    }
}

// GET A SPECIFIC PRIVACY POLICY

exports.viewPrivacyPolicy = async (req, res) => {

    // CONNECTING TO THE DB

    const client = await pool.connect();

    try {

        // DESTRUCTURING THE DATA FROM REQUEST QUERY

        const privacy_policy_id = req.query.privacy_policy_id;

        // SETTING UP QUERY TO FETECH THE SPECIFIC PRIVACY POLICY

        const query = 'SELECT * FROM privacy_policy WHERE privacy_policy_id= $1';

        // FETECHING DATA FROM THE DB USING QUERY ABOVE

        const result = await pool.query(query, [privacy_policy_id]);

        // CHECKING IF THE DATA IS SAVED THEN SENDING STATUS TRUE IN RESPONSE WITH RESULTS

        if (result.rows[0]) {
            res.json({
                message: "privacy policy fetched",
                status: true,
                result: result.rows[0]
            })
        }

        // CHECKING IF THE DATA IS NOT SAVED THEN SENDING STATUS FALSE IN RESPONSE

        else {
            res.json({
                message: "Could not fetch record",
                status: false
            })
        }

    }
    catch (err) {

        // EXCEPTION HANDLING

        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
    }
}

// VIEW ONLY ACTIVE PRIVACY POLICIES

exports.viewActivePrivacyPolicy = async (req, res) => {

    // CONNECTING TO DB

    const client = await pool.connect();

    try {

        // SETTING UP QUERY TO FETCH DATA FROM DB

        const query = 'SELECT * FROM privacy_policy WHERE status = $1';

        // FETCHING DATA FROM DB USING QUERY ABOVE

        const result = await pool.query(query, ['active']);

        // CHECKING IF THE DATA HAS BEEN FETECHED THEN SENDING STATUS TRUE WITH RESULTS IN RESPONSE

        if (result.rows[0]) {
            res.json({
                message: "Active privacy policy fetched",
                status: true,
                result: result.rows[0]
            })
        }

        // CHECKING IF THE DATA HAS NOT BEEN FETECHED THEN SENDING STATUS FALSE IN RESPONSE

        else {
            res.json({
                message: "No privacy policy found",
                status: false
            })
        }

    }
    catch (err) {
        
        // EXCEPTION HANDLING

        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
    }
}

// UPDATE PRIVACY POLICY

exports.updatePrivacyPolicy = async (req, res) => {

    // CONNECTING TO DB

    const client = await pool.connect();
    try {
        
        // DESTRUCTURING DATA FROM REQUEST BODY
        const privacy_policy_id = req.body.privacy_policy_id;
        const text = req.body.text;

        // SETTING UP QUERY TO UPDATE THE PRIVACY POLICY

        const query = 'UPDATE privacy_policy SET text = $2 WHERE privacy_policy_id= $1 RETURNING*';

        // UPDATING PRIVACY POLICY USING QUERY ABOVE

        const result = await pool.query(query, [privacy_policy_id, text]);

        // CHECKING IF THE DATA HAS BEEN UPDATED THEN SENDING STATUS TRUE IN RESPONSE

        if (result.rows[0]) {
            res.json({
                message: "Text updated",
                status: true,
                result: result.rows[0]
            })
        }

        // CHECKING IF THE DATA HAS NOT BEEN UPDATED THEN SENDING STATUS FALSE IN RESPONSE

        else {
            res.json({
                message: "Could not update record",
                status: false
            })
        }

    }
    catch (err) {
        
        // EXCEPTION HANDLING

        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
    }
}

// UPDATE PRIVACY POLICY STATUS IN DATABASE

exports.updateStatus = async (req, res) => {

    // CONNECTING TO DB

    const client = await pool.connect();
    try {

        // DESTRUCTURING DATA FROM REQUEST BODY

        const privacy_policy_id = req.body.privacy_policy_id;
        const status = req.body.status;
        let message2 = null;

        // CHECKING IF FIELD NAMED 'STATUS' IS 'ACTIVE' THEN SETTING IT TO 'INACTIVE'
        if (status == 'active') {

            // SETTING UP QUERY TO UPDATE STATUS TO INACTIVE

            let inactiveQuery = 'UPDATE privacy_policy SET status = $1 RETURNING*';

            // CHANGING STATUS TO INACTIVE IN DB USING QUERY ABOVE

            const inactivated = await pool.query(inactiveQuery, ['inactive']);

            // CHECKING IF THE STATUS HAS BEEN CHANGED THEN STORING RESPONSE MESSAGE IN VARIABLE

            if (inactivated.rows) {
                message2 = 'As you want to change this status active , all others will are in activated'
            }
        }

        // SETTING UP QUERY TO UPDATE STATUS TO ACTIVE

        const query = 'UPDATE privacy_policy SET status = $2 WHERE privacy_policy_id= $1 RETURNING*';

        // CHANGING STATUS TO ACTIVE IN DB USING QUERY ABOVE

        const result = await pool.query(query, [privacy_policy_id, status]);

        // CHECKING IF THE STATUS HAS BEEN CHANGED THEN SENDING RESPONSE WITH STATUS TRUE

        if (result.rows[0]) {
            res.json({
                message: "Status changed to active",
                status: true,
                message2: message2,
                result: result.rows[0],
            })
        }

        // CHECKING IF THE STATUS HAS NOT BEEN CHANGED THEN SENDING RESPONSE WITH STATUS FALSE

        else {
            res.json({
                message: "Could not update record",
                status: false
            })
        }

    }
    catch (err) {
        
        // EXCEPTION HANDLING
        
        res.json({
            message: "Error Occurred",
            status: false,
            error: err.message
        })
    }
    finally {
        client.release();
    }
}