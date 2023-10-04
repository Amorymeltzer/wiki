#!/usr/bin/env perl
# Test comparison of different JSON bodies

use 5.006;
use strict;
use warnings;

use AmoryBot::CratHighlighter qw(cmpJSON);
use Test::More;

# List users from each group.  Essentially cribbed from file.t/file.json, but
# without the one overlapper (Xaosflux)
my @buro = ('Acalamari', 'AmandaNP', 'Avraham', 'Bibliomaniac15', 'Cecropia', 'Deskana', 'Dweller', 'MBisanz', 'Maxim', 'Nihonjoe', 'Primefac', 'SilkTork', 'UninvitedCompany', 'Useight', 'Warofdreams', 'WereSpielChequers', 'Worm That Turned', 'Xeno');
my @inta = ('Amorymeltzer', 'Cyberpower678', 'Enterprisey', 'Evad37', 'Izno', 'MusikAnimal', 'MusikBot II', 'Oshwah', 'Ragesoss', 'Writ Keeper');
my @syso = ('28bytes', '331dot', '49TL', '5 albert square', '78.26', 'AFigureOfBlue', 'AKeen', 'Abecedare', 'Academic Challenger', 'Acalamari', 'Acdixon', 'Acroterion', 'Ad Orientem', 'Adam Bishop', 'Addshore', 'Admrboltz', 'Aervanath', 'After Midnight', 'Agathoclea', 'Airplaneman', 'Ajpolino', 'Al Ameer son', 'Alexf', 'AlexiusHoratius', 'Alison', 'AlistairMcMillan', 'Amakuru', 'AmandaNP', 'Ameliorate!', 'Amire80', 'Amortias', 'Amorymeltzer', 'Anachronist', 'Anarchyte', 'Ancheta Wis', 'Andrew Gray', 'Andrewa', 'AnemoneProjectors', 'Angelo.romano', 'Anne Delong', 'Anomie', 'AnomieBOT III', 'Antandrus', 'Anthere', 'Anthony Bradbury', 'Aoidh', 'Arbitrarily0', 'Arctic.gnome', 'ArnoldReinhold', 'Art LaPella', 'Arwel Parry', 'Atlant', 'Audacity', 'Ausir', 'Avraham', 'Awilley', 'Awiseman', 'AxelBoldt', 'AzaToth', 'B', 'BD2412', 'BDD', 'Babajobu', 'Bagumba', 'Barkeep49', 'BaronLarf', 'Bastique', 'Bbb23', 'Bcorr', 'Bearcat', 'Beeblebrox', 'Beetstra', 'Beland', 'Ben MacDui', 'Berig', 'BethNaught', 'Bibliomaniac15', 'Biblioworm', 'BigDom', 'BigHaz', 'BigrTex', 'Bilby', 'Billinghurst', 'Bishonen', 'Bkell', 'Bkonrad', 'Blablubbs', 'Black Kite', 'Bobak', 'Bobo192', 'Bongwarrior', 'BorgHunter', 'BorgQueen', 'Bovlb', 'BozMo', 'BradPatrick', 'Bradv', 'Brandon', 'Brendanconway', 'Brian Kendig', 'Brianga', 'Brighterorange', 'BrokenSegue', 'Bsadowski1', 'Bucketsofg', 'Bumm13', 'BusterD', 'C.Fred', 'CBDunkerson', 'CIreland', 'CJCurrie', 'CLW', 'CRGreathouse', 'Cabayi', 'Cactus.man', 'CactusWriter', 'Caknuck', 'Callanecc', 'Calliopejen1', 'Calmer Waters', 'CambridgeBayWeather', 'Canadian Paul', 'Canley', 'Canterbury Tail', 'CaptainEek', 'Carcharoth', 'Carlosguitar', 'Casliber', 'Catfish Jim and the soapdish', 'Causa sui', 'Cbl62', 'Cbrown1023', 'Cburnett', 'Cecropia', 'Ceranthor', 'Cerebellum', 'CesarB', 'Ceyockey', 'Charles Matthews', 'Chetsford', 'Choess', 'Chris G', 'ChrisTheDude', 'Christopher Sundita', 'Chuq', 'Circeus', 'Citicat', 'Ckatz', 'Cleared as filed', 'Clpo13', 'Cobi', 'Colin M', 'Commander Keane', 'ComplexRational', 'Connormah', 'Cordless Larry', 'Courcelles', 'Crazycomputers', 'Crum375', 'Cryptic', 'Cuchullain', 'Cullen328', 'Cwmhiraeth', 'Cyberpower678', 'Cyclonebiskit', 'Cyp', 'Cyrius', 'Czar', 'DDima', 'DMacks', 'DYKUpdateBot', 'DaGizza', 'Dale Arnett', 'DanCherek', 'Danaman5', 'Daniel', 'Daniel Case', 'Daniel Quinlan', 'Dank', 'Dante Alighieri', 'DarkFalls', 'Darwinek', 'DatGuy', 'Dave souza', 'David Eppstein', 'David Fuchs', 'David Gerard', 'David Levy', 'DavidLevinson', 'DavidWBrooks', 'Davidcannon', 'De728631', 'Deacon of Pndapetzim', 'Deb', 'Decltype', 'Deepfriedokra', 'Deiz', 'Dekimasu', 'Delirium', 'Delldot', 'DeltaQuadBot', 'Dennis Brown', 'Deor', 'DerHexer', 'Derek Ross', 'Deryck Chan', 'Deskana', 'Deville', 'Dgies', 'Diannaa', 'Dino', 'Dinoguy1000', 'Discospinster', 'Djsasso', 'Doc James', 'Doczilla', 'Dodger67', 'Dominic', 'Donald Albury', 'Doug Weller', 'DrKay', 'DragonflySixtyseven', 'Dragons flight', 'Dreamy Jazz', 'Drmies', 'Dumelow', 'Dweller', 'ERcheck', 'ESkog', 'Eagles247', 'Ealdgyth', 'Earl Andrew', 'East718', 'Ed g2s', 'EdJohnston', 'Edcolins', 'Eddie891', 'Edison', 'Edit filter', 'Edward', 'Egil', 'Ekabhishek', 'El C', 'Elahrairah', 'Elf', 'Elonka', 'EncMstr', 'Enterprisey', 'Ergo Sum', 'ErikHaugen', 'ErrantX', 'Espresso Addict', 'EurekaLott', 'Euryalus', 'Ev', 'Evad37', 'EvanProdromou', 'EvergreenFir', 'Explicit', 'Extraordinary Writ', 'Ezhiki', 'FT2', 'Fabrictramp', 'Fastily', 'Father Goose', 'Favonian', 'Fawcett5', 'Fayenatic london', 'Feezo', 'Femke', 'Fences and windows', 'Fenix down', 'Ferret', 'Feydey', 'Filelakeshoe', 'Finlay McWalter', 'Firefangledfeathers', 'Firefly', 'Firsfron', 'Fish and karate', 'FloNight', 'Floquenbeam', 'Fluffernutter', 'Fox', 'Frank', 'Frazzydee', 'Furrykef', 'Future Perfect at Sunrise', 'Fuzheado', 'Fvasconcellos', 'GB fan', 'Gabbe', 'Gadfium', 'Gaius Cornelius', 'Galobtter', 'Gamaliel', 'Ganeshk', 'Garion96', 'Gatoclass', 'Ged UK', 'GeeJo', 'GeneralNotability', 'GeneralizationsAreBad', 'Geni', 'Geniac', 'Gentgeen', 'Georgewilliamherbert', 'Gfoley4', 'GiantSnowman', 'Gilliam', 'Gimmetrow', 'Girth Summit', 'Glen', 'Go Phightins!', 'Gogo Dodo', 'Golbez', 'GoldRingChip', 'Gonzo fan2007', 'Good Olfactory', 'Goodnightmush', 'GorillaWarfare', 'Graeme Bartlett', 'Graham87', 'Grant65', 'Grendelkhan', 'Grondemar', 'Ground Zero', 'Grutness', 'Guerillero', 'Guettarda', 'Gurubrahma', 'Gyrofrog', 'HJ Mitchell', 'Hadal', 'Hammersoft', 'Happy-melon', 'Harrias', 'Harryboyles', 'Haukurth', 'Hbdragon88', 'Heimstern', 'HelloAnnyong', 'Henry Flower', 'Heron', 'Hesperian', 'Hey man im josh', 'HickoryOughtShirt?4', 'Hiding', 'HighInBC', 'Hoary', 'Howcheng', 'Huntster', 'Huon', 'Hurricanehink', 'Hut 8.5', 'Hyacinth', 'I JethroBT', 'Ian.thomson', 'IanManka', 'Ianblair23', 'IceKarma', 'Ike9898', 'Ikuzaf', 'Ilyanep', 'Infrogmation', 'Ingenuity', 'Inter', 'Iridescent', 'IronGargoyle', 'Isabelle Belato', 'Ish ishwar', 'It Is Me Here', 'Ivanvector', 'Ixfd64', 'Izno', 'J Milburn', 'J04n', 'JBW', 'JHunterJ', 'JIP', 'JJMC89', 'JJMC89 bot III', 'JLaTondre', 'JPG-GR', 'JaGa', 'Jac16888', 'Jake Wartenberg', 'JamesTeterenko', 'Jamesofur', 'January', 'Jarry1250', 'Jason Quinn', 'Jauerback', 'Jay', 'Jayjg', 'Jayron32', 'Jbmurray', 'Jc37', 'Jdforrester', 'Jeepday', 'Jesse Viviano', 'JesseW', 'Jfdwolff', 'Jimfbleak', 'Jinian', 'Jmabel', 'Jnc', 'Jni', 'Jo-Jo Eumerus', 'JoJan', 'Joe Roe', 'Johan Elisson', 'John K', 'John M Wolfson', 'JohnOwens', 'Johnleemk', 'Johnuniq', 'Josiah Rowe', 'Joy', 'Joyous!', 'Jpgordon', 'Jrdioko', 'Julia W', 'Juliancolton', 'Jusjih', 'Justlettersandnumbers', 'Jwrosenzweig', 'K6ka', 'KFP', 'KTC', 'Kaihsu', 'KaisaL', 'Kaiser matias', 'Kane5187', 'Kanonkas', 'Karl Dickman', 'Kbdank71', 'Kbh3rd', 'Keegan', 'Keenan Pepper', 'Keilana', 'Keith D', 'Kelapstick', 'Kicking222', 'Killiondude', 'King of Hearts', 'Kingpin13', 'Kingturtle', 'Kinu', 'Kizor', 'Kjkolb', 'Kosack', 'KrakatoaKatie', 'Kralizec!', 'Ks0stm', 'Ktsquare', 'Kuru', 'Kurykh', 'Kusma', 'L235', 'LFaraone', 'LadyofShalott', 'Lar', 'Larryv', 'Lectonar', 'Lee Vilenski', 'Legoktm', 'Lenticel', 'Less Unless', 'Lethe', 'Lexicon', 'Leyo', 'Liz', 'Llywrch', 'Lofty abyss', 'Lord Roem', 'Lourdes', 'Lowellian', 'Lquilter', 'LuK3', 'Luk', 'Lustiger seth', 'MER-C', 'MIDI', 'MLauba', 'MSGJ', 'Mackensen', 'Magnus Manske', 'Magog the Ogre', 'Mahagaja', 'Maile66', 'Mailer diablo', 'Mairi', 'Malcolmxl5', 'Malinaccier', 'Mandsford', 'Marasmusine', 'Marine 69-71', 'Mark83', 'Masem', 'MastCell', 'Master Jay', 'Materialscientist', 'Mattbr', 'Mattinbgn', 'Mattythewhite', 'Maury Markowitz', 'MaxSem', 'Maxim', 'Mazca', 'Meelar', 'Megalibrarygirl', 'MelanieN', 'Melburnian', 'Menchi', 'Meno25', 'Merge bot', 'Metamagician3000', 'Metropolitan90', 'Mets501', 'Mfield', 'Michael Greiner', 'Michael Hardy', 'Michael Snow', 'Michig', 'Mifter', 'Mike Cline', 'Mike Peel', 'Mike Rosoft', 'Mike Selinker', 'Mikeblas', 'MilborneOne', 'Mindmatrix', 'Minesweeper', 'Miniapolis', 'MisfitToys', 'Missvain', 'Mitchazenia', 'Mjroots', 'Mkdw', 'Mlaffs', 'MoRsE', 'Moabdave', 'Modussiccandi', 'Mojo Hand', 'Moncrief', 'Moneytrees', 'Montrealais', 'Moondyne', 'Moonriddengirl', 'Morwen', 'Mr. Stradivarius', 'MrKIA11', 'Muboshgu', 'MusikAnimal', 'MusikBot II', 'Mz7', 'Mzajac', 'NJA', 'Nabla', 'NativeForeigner', 'NawlinWiki', 'Necrothesp', 'Neutrality', 'Newslinger', 'Newyorkbrad', 'Nick', 'Nick Moyes', 'Nick-D', 'Night Gyr', 'Nightstallion', 'Nihiltres', 'Nihonjoe', 'NinjaRobotPirate', 'Nixdorf', 'Nlu', 'NoSeptember', 'Nohat', 'Northamerica1000', 'Novem Linguae', 'NrDg', 'Nthep', 'NuclearWarfare', 'Number 57', 'ONUnicorn', 'Ocaasi', 'OhanaUnited', 'Ohnoitsjamie', 'OlEnglish', 'Oleg Alexandrov', 'Olivier', 'Omegatron', 'Opabinia regalis', 'Orangemike', 'Orderinchaos', 'Orlady', 'Oshwah', 'OverlordQ', 'Owen', 'OwenX', 'PBS', 'PFHLai', 'Panyd', 'Parsecboy', 'Patar knight', 'Patrick', 'Paul August', 'Paul Erik', 'Paulmcdonald', 'Pax:Vobiscum', 'Pbsouthwood', 'Peacemaker67', 'PedanticallySpeaking', 'Pedro', 'Pegship', 'Pengo', 'Peteforsyth', 'Phantomsteve', 'Pharos', 'Phil Boswell', 'PhilKnight', 'Pinkville', 'Plastikspork', 'Ponyo', 'Postdlf', 'Pppery', 'Premeditated Chaos', 'PresN', 'PrimeHunter', 'Primefac', 'ProhibitOnions', 'Prolog', 'Proteus', 'ProveIt', 'Pschemp', 'QEDK', 'Quarl', q{R'n'B}, 'RJFJR', 'RL0919', 'Ragesoss', 'Randykitty', 'Rbrwr', 'ReaderofthePack', 'Reaper Eternal', 'Red Phoenix', 'RedWolf', 'Redrose64', 'Reedy', 'RegentsPark', 'Rehman', 'Remember the dot', 'Renata3', 'Richwales', 'Rick Block', 'RickinBaltimore', 'Rigadoun', 'Risker', 'Ritchie333', 'Rklawton', 'Rlandmann', 'Rlendog', 'Rmhermen', 'RobLa', 'RobertG', 'Robin Patterson', 'RockMFR', 'RockMagnetist', 'Roger Davies', 'Rogerd', 'Rosguill', 'Rosiestep', 'RoySmith', 'Ruhrfisch', 'Runningonbrains', 'Ruslik0', 'SQL', 'ST47', 'ST47ProxyBot', 'Sadads', 'Salix alba', 'Salvio giuliano', 'Sam', 'Samir', 'Samwalton9', 'Sandstein', 'Sarahj2107', 'SarekOfVulcan', 'Sasquatch', 'Satori Son', 'Saxifrage', 'Schutz', 'Schwede66', 'Scott', 'Scott Burley', 'Scott5114', 'ScottDavis', 'ScottishFinnishRadish', 'Sdrqaz', 'Seattle Skier', 'SebastianHelm', 'Secretlondon', 'Seddon', 'Ser Amantio di Nicolao', 'Seraphimblade', 'Sergecross73', 'Sesel', 'Sethant', 'Sgeureka', 'Shanes', 'Shirt58', 'Shoeofdeath', 'Shubinator', 'Shyamal', 'SilkTork', 'SimonP', 'Sir Nicholas de Mimsy-Porpington', 'Sir Sputnik', 'Sj', 'Sjakkalle', 'Sjb72', 'Sky Harbor', 'Slakr', 'Slambo', 'Slon02', 'Slp1', 'Smalljim', 'Smartse', 'Smith609', 'Smurrayinchester', 'Snowolf', 'SoWhy', 'Someguy1221', 'Somno', 'SouthernNights', 'SpacemanSpiff', 'Spangineer', 'Spartaz', 'Spellcast', 'Spencer', 'Sphilbrick', 'Spicy', 'Spike Wilbury', 'SpuriousQ', 'Sro23', 'Staecker', 'Stan Shebs', 'Star Mississippi', 'Starblind', 'Staxringold', 'Stephan Schulz', 'Stephen', 'Steven Walling', 'Stifle', 'Stwalkerster', 'Sugarfish', 'Sundar', 'SuperMarioMan', 'Swarm', 'Swatjester', 'TFA Protector Bot', 'TJMSmith', 'TLSuda', 'TParis', 'Tabercil', 'TadejM', 'Tariqabjotu', 'Tassedethe', 'Tavix', 'Tawker', 'Tcncv', 'TeaDrinker', 'Tedder', 'TenOfAllTrades', 'The Anome', 'The Blade of the Northern Lights', 'The Bushranger', 'The Cunctator', 'The Earwig', 'The Interior', 'The JPS', 'The Land', 'The Moose', 'The Tom', 'The Wordsmith', 'The ed17', 'The wub', 'TheCatalyst31', 'TheSandBot', 'TheSandDoctor', 'Theleekycauldron', 'TheresNoTime', 'Thryduulf', 'Thue', 'Thumperward', 'Tide rolls', 'TigerShark', 'Tim Ivorson', 'Tim Starling', 'Timotheus Canens', 'Timrollpickering', 'Timwi', 'Tinucherian', 'Titodutta', 'Titoxd', 'ToBeFree', 'Toby Bartels', 'Tom Morris', 'Tom harrison', 'TomStar81', 'TommyBoy', 'Tone', 'Trappist the monk', 'Trialpears', 'Trialsanderrors', 'Tyrol5', 'Tóraí', 'U193581', 'Ucucha', 'Uncle G', 'UninvitedCompany', 'Urhixidur', 'Useight', 'Utcursch', 'UtherSRG', 'Valereee', 'Valfontis', 'Valley2city', 'Vanamonde93', 'Vanjagenije', 'Vary', 'VegaDark', 'VernoWhitney', 'Verrai', 'Versageek', 'VersedFenrir', 'Victuallers', 'Visviva', 'Voice of Clam', 'Vsmith', 'WOSlinker', 'Waggers', 'Waldyrious', 'Waltpohl', 'Warofdreams', 'Wbm1058', 'Wehwalt', 'WereSpielChequers', 'Whouk', 'Whpq', 'Widr', 'Wikiacc', 'Willking1979', 'WilyD', 'Wizardman', 'Woody', 'Woohookitty', 'Worm That Turned', 'Wouterstomp', 'Writ Keeper', 'Wtmitchell', 'Wugapodes', 'Wwoods', 'X!', 'Xaosflux', 'Xeno', 'Xezbeth', 'Xymmax', 'Y', 'Yamaguchi先生', 'Yamamoto Ichiro', 'Yamla', 'Yaris678', 'Ymblanter', 'Ynhockey', 'Z1720', 'Zanimum', 'Zero0000', 'Zippy', 'Zsinj', 'Zzuuzz', 'Zzyzx11');

# Name of test points to array:
## First two: Array refs cum hash refs (via makeHash) passed to cmpJSON
## Last two are expected added/removed array refs, respectively
my %tests = (
	     empty => [([])x4],
	     identicalBuro => [(\@buro)x2, ([])x2],
	     identicalInta => [(\@inta)x2, ([])x2],
	     actual => [(\@buro, \@inta)x2],
	     identicalSyso => [(\@syso)x2, ([])x2]
	    );

my $count = scalar keys %tests;
plan tests => 3+3*$count;

# First one technically excessive
is(cmpJSON(), undef, 'empty');
is(cmpJSON('42'), undef, 'queryRef not hashref');
is(cmpJSON({}, '42'), undef, 'objectRef not hashref');


foreach my $test (sort keys %tests) {
  # Simulate the hashRef that results from parsing the JSON
  my %qr = makeHash(\@{$tests{$test}[0]});
  my %or = makeHash(\@{$tests{$test}[1]});

  my ($fileState, $fileAdded, $fileRemoved) = cmpJSON(\%qr, \%or);

  is($fileState, $test eq 'actual', "$test - Accurate state");
  is_deeply(\@{$fileAdded}, \@{$tests{$test}[2]}, "$test - Added");
  is_deeply(\@{$fileRemoved}, \@{$tests{$test}[3]}, "$test - Removed");
}



# Turn an array into a lookup hash, just for the sake of making matching the
# data easier.
sub makeHash {
  return map {$_ => 1} @{$_[0]};
}
