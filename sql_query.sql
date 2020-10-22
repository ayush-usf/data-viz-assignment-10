SELECT f.fips, e.percentage, f.name
FROM d3.election e
inner join
d3.fips f
on
e.county = f.name and e.state_abbr=f.state