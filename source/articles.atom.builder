xml.instruct!
xml.feed "xmlns" => "http://www.w3.org/2005/Atom" do
  xml.title "Higher Order Heroku"
  xml.subtitle "Building applications the Heroku way"
  xml.id "http://www.higherorderheroku.com/"
  xml.link "href" => "http://www.higherorderheroku.com/"
  xml.link "href" => "http://www.higherorderheroku.com/articles.atom", "rel" => "self"
  xml.updated "#{Date.parse(articles.first.data['date']).iso8601}T00:00:00-08:00"

  coalesce(articles, links).each do |entry|
    xml.entry do
      if(link_entry?(entry))
        xml.title entry.data['title']
        xml.link "rel" => "alternate", "href" => entry.data['url']
        xml.id entry.data['url']
        xml.published "#{Date.parse(entry.data['date']).iso8601}T00:00:00-08:00"
        xml.updated "#{Date.parse(entry.data['date']).iso8601}T00:00:00-08:00"
        xml.author { xml.name "Other" }
      else
        xml.title entry.data['title']
        xml.link "rel" => "alternate", "href" => "http://www.higherorderheroku.com/#{entry.destination_path}"
        xml.id "http://www.higherorderheroku.com/#{entry.destination_path}"
        xml.published "#{Date.parse(entry.data['date']).iso8601}T00:00:00-08:00"
        xml.updated "#{Date.parse(entry.data['date']).iso8601}T00:00:00-08:00"
        xml.author { xml.name "Ryan Daigle" }
        xml.content entry.render(:layout => false), "type" => "html"
      end
    end
  end
end