import RSS from "rss";
module.exports = (app) => {
  let {Story,User} = app.models;
  let feed = new RSS({
      title: 'Flap feed',
      description: 'latest reviews from flap',
      feed_url: 'http://api.flaper.org/feed',
      site_url: 'http://flaper.org',
      image_url: 'http://flaper.org/favicon.ico',
      docs: 'http://flaper.org/feed/docs',
      managingEditor: 'Flaper staff',
      webMaster: 'Flaper staff',
      copyright: '2016 Flaper',
      language: 'ru',
      categories: ['reviews'],
      ttl: '600',
  });

  app.get('/feed', (req,res) => {
    let {region, mainDomain,format} = req.query,
        filter = {where:{type:'review',status:'active'}, limit:100};
    if (region) filter.where.region = region;
    if (mainDomain) filter.where.mainDomain = mainDomain;
    Story.find(filter)
    .then(
      result =>   {
        if (format === "rss") {
          result.forEach(item => {
            let {title,contentHTML,rating,created,id,userId} = item;
                // author = User.findById(userId);
            if(feed.xml().indexOf(id.toString()) === -1)
            feed.item({
                title:  title,
                description: contentHTML,
                guid: id.toString(),
                url: `http://flaper.org/s/${id}`, // link to the item
                categories: ['review'], // optional - array of item categories
                date: created, // any format that js Date can parse.
                custom_elements: [
                  {'rating': rating}
                ]
            });
          })
          res.send(feed.xml());
        }
        else {
          res.send(result)
        }
      }
    )
  })
}
