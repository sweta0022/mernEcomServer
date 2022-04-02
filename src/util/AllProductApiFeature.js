class AllProductApiFeature
{
    constructor( query, queryString )
    {
        this.query = query;
        this.queryString = queryString;
    }

    search()
    {
        const keyword = this.queryString.keyword ? {
            name:{
                $regex : this.queryString.keyword,
                $options: "i"       // i means case in-sensitive
            }
        } : {};

        this.query = this.query.find({...keyword});
        return this;
    }

    filter()
    {
        let queryCopy = {...this.queryString} // if we direct pass this.queryString then reference will asign and if we change anything on queryCopy then queryString will also modify

        const removeFields = ["keyword","page"];
        removeFields.forEach( (key) => delete queryCopy[key] );

         // filter for price
        let queryStr = JSON.stringify(queryCopy);        
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}` );
        queryCopy = JSON.parse(queryStr)

        this.query = this.query.find(queryCopy);
       
        return this;

    }

    paginate(resultPerPage)
    {
        let currentPage = Number(this.queryString.page) || 1; 
        let skip = resultPerPage - (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }
}

module.exports = AllProductApiFeature