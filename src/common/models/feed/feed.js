import RSS from "rss";
import _ from 'lodash';

module.exports = (Feed) => {
  const ALLOWED_MODELS = ['Story'];
  const MAX_FEED_LENGTH = 100;
  const FORMATS = ['rss','json'];
  Feed.commonInit(Feed);
  Feed.disableAllRemotesExcept(Feed, []);
  Feed.getFeed = getFeed;

  let rssfeed = new RSS({
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

  Feed.remoteMethod(
    'getFeed',
    {
      http: {path: '/', verb: 'get'},
      description: `Возвращает последние Story с type = review и status = active.`,
      accessType: 'READ',
      accepts: [
        {
          arg: 'domain',
          type: 'string',
          description: 'mainDomain name for object related to reviews'
        },
        {
          arg: 'region',
          type: 'string',
          description: 'region of object related to reviews'
        },
        {
          arg: 'type',
          type: 'string',
          description: 'story type. default - all stories'
        },
        {
          arg: 'format',
          type: 'string',
          description: 'output format, for now accepts "rss" value'
        }
      ],
      returns: {root: true}
    }
  );
  function formatFeed(feed,format) {
    switch (format.trim().toLowerCase()) {
      case "rss":
          let cache = rssfeed.xml();
          feed.forEach(item => {
            let {title,contentHTML,rating,created,id,userId} = item;
            if(cache.indexOf(id.toString()) === -1)
            rssfeed.item({
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
        return rssfeed.xml();
      default:
        return feed;
    }
  }
  function* getFeed(domain,region,type,format) {
    let Story = Feed.app.models.Story,
        filter = {
          order: "created DESC",
          limit: MAX_FEED_LENGTH,
          where: {}
        };
    format = format ? FORMATS.indexOf(format) !== -1 ? format : "json" : "json";

    if (domain) {
      filter.where.mainDomain = domain;
    }
    if (region)
      filter.where.region = region;
    if (type)
      filter.where.type = type;
    let feed = yield Story.scopeActive(filter);
    return formatFeed(feed, format);
  }
};
