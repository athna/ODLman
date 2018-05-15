#!/usr/bin/perl
# 説明   : 環境関連の値
# 作成日 : 2016/06/10 
# 作成者 : 江野高広

use strict;
use warnings;

package Common_system;

# 本システムのDB への接続変数。
sub DB_connect_parameter {
 return('ODLman', 'localhost', 'opendaylightman', 'netconf830');
}


# ODL サーバーのアドレス。
sub ODL_ip_address {
 return('192.168.203.111');
}


# Curl の共通ファイルのパス
sub curl_common {
 return('/usr/local/ODLman/pl/curl_common.pl');
} 

1;
