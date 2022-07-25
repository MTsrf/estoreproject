const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './public/Images/'+file.fieldname;
        if (file.fieldname == "productImages") {
            cb(null,dir);
        }else if(file.fieldname == "profileimages"){
            cb(null,dir)
        }else if(file.fieldname == "BannerImages"){
            cb(null,dir)
        }else if(file.fieldname == "featuredCategory"){
            cb(null,dir)
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + file.originalname.substring(file.originalname.lastIndexOf('.'))
        cb(null, file.fieldname + "-" + uniqueSuffix);
    },
});

module.exports = store = multer({ storage: storage })