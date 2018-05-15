#!/usr/bin/perl
# 説明   : UUID を作るだけ。
# 作成者 : 江野高広
# 作成日 : 2016/06/22

use strict;
use CGI;
use JSON;
use Data::UUID;

my $cgi = new CGI;
my $input_id = $cgi -> param('input_id');
my $N        = $cgi -> param('N');

my $ug   = new Data::UUID;
my $uuid = $ug -> create();
my $string_uuid = $ug -> to_string($uuid);

my %results = (
 'input_id' => $input_id,
 'N' => $N,
 'uuid' => $string_uuid
);

my $json_results = &JSON::to_json(\%results);

print "Content-type: text/plain; charset=UTF-8\n\n";
print $json_results;
 