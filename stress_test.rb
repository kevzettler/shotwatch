require 'rubygems'
require 'net/http'
require 'uri'
require 'parallel'

browsers = [
            {:name => "iexplore",
              :version => "6"},
            {:name => "iexplore",
              :version => "7"},
            {:name => "iexplore",
              :version => "8"},
            {:name => "safari",
              :version => "4"},
            {:name => "firefox",
              :version => "3.6"},
            {:name => "googlechrome",
              :version => "4"}]

# Uncomment to change the picture
#png_url = "http://blogs.nature.com/news/thegreatbeyond/biohazard.png"
#png_url = "https://saucelabs.com/jobs/cc166bba20685b34dce43e6b3eae64ab/0001screenshot.png"
#png_url = "http://upload.wikimedia.org/wikipedia/en/0/03/Tarepanda.png"
png_url = "http://news.ycombinator.com/"
png_url = "http://4chan.org/b/"

Parallel.map(browsers, :in_processes => browsers.count)  do |browser|
  url = URI.parse('http://localhost:8081')
  res = Net::HTTP.start(url.host, url.port) {|http|
    http.get("/addUrl?browser=#{browser[:name]}&version=#{browser[:version]}&url=#{png_url}")
  }
end
