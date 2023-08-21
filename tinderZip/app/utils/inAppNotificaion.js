
async function sendInAppNotification(sender , receiver , text){
    try{
        
        const query = 'INSERT INTO notifications (sender , receiver , text) VALUES ($1 ,$2 , $3) RETURNING *';
        const result = await pool.query(query , [sender , receiver , text]);

        if(result){
            if(result.rows[0]){
                return true
            }else {
                return false
            }
        }
    }catch(err){
        console.log(err);
        return false
    }
}

module.exports = sendInAppNotification;