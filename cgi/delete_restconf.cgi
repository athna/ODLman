#!/usr/bin/perl
# 説明   : 登録削除。
# 作成者 : 江野高広
# 作成日 : 2016/06/22

use strict;
use warnings;

use CGI;
use JSON;

use lib '/usr/local/ODLman/lib';
use Common_system;
use Access2DB;



#
# Restconf ID の確認。
#
my $cgi = new CGI;
my $restconf_id = $cgi -> param('restconf_id');

unless(defined($restconf_id) && (length($restconf_id) > 0)){
 print "Content-type: text/plain; charset=UTF-8\n\n";
 print '{"result":0}';
 exit(0);
}



#
# DB アクセスのためのオブジェクトを作成する。
#
my ($DB_name, $DB_host, $DB_user, $DB_password) = &Common_system::DB_connect_parameter();
my @DB_connect_parameter_list                   = ('dbi:mysql:' . $DB_name . ':' . $DB_host, $DB_user, $DB_password);
my $access2db                                   = Access2DB -> open(@DB_connect_parameter_list);



#
# 削除
#
my $condition = "where vcRestconfId = '" . $restconf_id . "'";

$access2db -> set_delete('T_Restconf', $condition);
$access2db -> delete_exe;

$access2db -> set_delete('T_Json', $condition);
$access2db -> delete_exe;

$access2db -> set_delete('T_Group');
$access2db -> delete_exe;

$access2db -> set_delete('T_Input');
$access2db -> delete_exe;



$access2db -> close;



print "Content-type: text/plain; charset=UTF-8\n\n";
print '{"result":1,"restconf_id":"' . $restconf_id . '"}';
