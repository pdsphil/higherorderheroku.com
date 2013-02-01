module PageHelpers

  def articles(limit = 15)
    @articles ||= date_sort(sitemap.resources.select { |r| r.path.start_with?('articles/') })[0..limit]
  end

  def links(limit = 15)
    @links ||= date_sort(data.links)[0..limit]
  end

  def coalesce(col1, col2, limit = 30)
    date_sort(col1 + col2)[0..limit]
  end

  def date_sort(col)
    col.sort { |a, b| Date.parse(b.data['date']) <=> Date.parse(a.data['date'])}
  end

  def link_entry?(article_or_link)
    article_or_link.data.key?('url')
  end
end