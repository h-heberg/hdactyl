<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>{{ config('app.name', 'Panel') }} - @yield('title')</title>
  <meta content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" name="viewport">
  <meta name="_token" content="{{ csrf_token() }}">

  <link rel="icon" type="image/png" href="/favicons/favicon-96x96.png" sizes="96x96" />
  <link rel="icon" type="image/svg+xml" href="/favicons/favicon.svg" />
  <link rel="shortcut icon" href="/favicons/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png" />
  <meta name="apple-mobile-web-app-title" content="H-Heberg" />
  <link rel="manifest" href="/favicons/site.webmanifest" />

  <meta name="theme-color" content="#000000">
  <meta name="darkreader-lock">

  @include('layouts.scripts')

  @section('scripts')
  {!! Theme::css('vendor/select2/select2.min.css?t={cache-version}') !!}
  {!! Theme::css('vendor/bootstrap/bootstrap.min.css?t={cache-version}') !!}
  {!! Theme::css('vendor/adminlte/admin.min.css?t={cache-version}') !!}
  {!! Theme::css('vendor/adminlte/colors/skin-blue.min.css?t={cache-version}') !!}
  {!! Theme::css('vendor/sweetalert/sweetalert.min.css?t={cache-version}') !!}
  {!! Theme::css('vendor/animate/animate.min.css?t={cache-version}') !!}
  {!! Theme::css('css/pterodactyl.css?t={cache-version}') !!}
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/ionicons/2.0.1/css/ionicons.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">

  <!--[if lt IE 9]>
            <script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
            <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
            <![endif]-->
  @show
</head>

<body class="hold-transition skin-blue fixed sidebar-mini">
  <div class="wrapper">
    <header class="main-header">
      <a href="{{ route('index') }}" class="logo">
        <!-- <span>{{ config('app.name', 'Panel') }}</span> -->
        <svg height='30' viewBox='0 0 573 120' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path
            d='M299.32 93.152C294.136 93.152 289.592 92.224 285.688 90.368C281.848 88.448 278.84 85.824 276.664 82.496C274.488 79.104 273.4 75.2 273.4 70.784C273.4 65.28 274.648 60.48 277.144 56.384C279.64 52.288 282.968 49.12 287.128 46.88C291.288 44.64 295.896 43.52 300.952 43.52C305.112 43.52 308.632 44.224 311.512 45.632C314.456 46.976 316.792 48.8 318.52 51.104C320.248 53.408 321.4 56.032 321.976 58.976C322.616 61.92 322.744 64.928 322.36 68C322.168 69.664 321.688 70.752 320.92 71.264C320.152 71.776 319.192 72.032 318.04 72.032H288.568L289.912 63.68H309.496L308.056 64.736C308.312 62.944 308.216 61.376 307.768 60.032C307.32 58.624 306.52 57.536 305.368 56.768C304.216 56 302.68 55.616 300.76 55.616C298.968 55.616 297.432 56.032 296.152 56.864C294.872 57.632 293.848 58.72 293.08 60.128C292.312 61.472 291.768 63.04 291.448 64.832L290.872 68.768C290.296 72.288 290.936 74.976 292.792 76.832C294.712 78.624 297.592 79.52 301.432 79.52C302.776 79.52 304.312 79.392 306.04 79.136C307.768 78.816 309.304 78.368 310.648 77.792C312.504 77.088 314.04 76.992 315.256 77.504C316.536 77.952 317.464 78.752 318.04 79.904C318.616 81.056 318.84 82.368 318.712 83.84C318.584 85.248 318.072 86.592 317.176 87.872C316.28 89.088 314.968 90.016 313.24 90.656C311 91.552 308.696 92.192 306.328 92.576C304.024 92.96 301.688 93.152 299.32 93.152ZM362.257 93.152C358.929 93.152 355.985 92.416 353.425 90.944C350.929 89.472 349.137 87.392 348.049 84.704L349.393 80.288L348.913 83.648C348.529 86.656 347.441 88.96 345.649 90.56C343.857 92.16 341.457 92.96 338.449 92.96C335.505 92.96 333.361 92 332.017 90.08C330.737 88.16 330.353 85.504 330.865 82.112L338.737 32.576C339.185 29.568 340.305 27.296 342.097 25.76C343.889 24.16 346.321 23.36 349.393 23.36C352.337 23.36 354.481 24.32 355.825 26.24C357.169 28.16 357.585 30.816 357.073 34.208L354.289 51.872H353.329C355.121 49.184 357.361 47.136 360.049 45.728C362.737 44.256 365.649 43.52 368.785 43.52C372.305 43.52 375.377 44.384 378.001 46.112C380.625 47.776 382.641 50.176 384.049 53.312C385.521 56.384 386.257 60 386.257 64.16C386.257 69.728 385.233 74.72 383.185 79.136C381.201 83.488 378.385 86.912 374.737 89.408C371.153 91.904 366.993 93.152 362.257 93.152ZM358.129 79.52C360.049 79.52 361.713 78.912 363.121 77.696C364.529 76.48 365.617 74.816 366.385 72.704C367.153 70.528 367.537 68.032 367.537 65.216C367.537 62.656 366.961 60.672 365.809 59.264C364.657 57.856 363.025 57.152 360.913 57.152C358.993 57.152 357.329 57.76 355.921 58.976C354.513 60.192 353.425 61.888 352.657 64.064C351.889 66.176 351.505 68.64 351.505 71.456C351.505 74.016 352.081 76 353.233 77.408C354.449 78.816 356.081 79.52 358.129 79.52ZM420.719 93.152C415.535 93.152 410.991 92.224 407.087 90.368C403.247 88.448 400.239 85.824 398.063 82.496C395.887 79.104 394.799 75.2 394.799 70.784C394.799 65.28 396.047 60.48 398.543 56.384C401.039 52.288 404.367 49.12 408.527 46.88C412.687 44.64 417.295 43.52 422.351 43.52C426.511 43.52 430.031 44.224 432.911 45.632C435.855 46.976 438.191 48.8 439.919 51.104C441.647 53.408 442.799 56.032 443.375 58.976C444.015 61.92 444.143 64.928 443.759 68C443.567 69.664 443.087 70.752 442.319 71.264C441.551 71.776 440.591 72.032 439.439 72.032H409.967L411.311 63.68H430.895L429.455 64.736C429.711 62.944 429.615 61.376 429.167 60.032C428.719 58.624 427.919 57.536 426.767 56.768C425.615 56 424.079 55.616 422.159 55.616C420.367 55.616 418.831 56.032 417.551 56.864C416.271 57.632 415.247 58.72 414.479 60.128C413.711 61.472 413.167 63.04 412.847 64.832L412.271 68.768C411.695 72.288 412.335 74.976 414.191 76.832C416.111 78.624 418.991 79.52 422.831 79.52C424.175 79.52 425.711 79.392 427.439 79.136C429.167 78.816 430.703 78.368 432.047 77.792C433.903 77.088 435.439 76.992 436.655 77.504C437.935 77.952 438.863 78.752 439.439 79.904C440.015 81.056 440.239 82.368 440.111 83.84C439.983 85.248 439.471 86.592 438.575 87.872C437.679 89.088 436.367 90.016 434.639 90.656C432.399 91.552 430.095 92.192 427.727 92.576C425.423 92.96 423.087 93.152 420.719 93.152ZM459.944 92.96C457 92.96 454.824 92.064 453.416 90.272C452.072 88.416 451.656 85.824 452.168 82.496L456.968 52.544C457.416 49.664 458.504 47.488 460.232 46.016C462.024 44.48 464.392 43.712 467.336 43.712C470.216 43.712 472.328 44.608 473.672 46.4C475.016 48.192 475.4 50.752 474.824 54.08L474.44 56.384H473.576C474.728 52.608 476.712 49.568 479.528 47.264C482.344 44.896 485.576 43.68 489.224 43.616C491.272 43.616 492.808 44.096 493.832 45.056C494.856 45.952 495.368 47.488 495.368 49.664C495.368 52.992 494.6 55.424 493.064 56.96C491.592 58.496 489.32 59.424 486.248 59.744L482.504 60.032C479.432 60.352 477.224 61.248 475.88 62.72C474.6 64.128 473.704 66.432 473.192 69.632L470.888 84.032C470.44 87.04 469.32 89.28 467.528 90.752C465.736 92.224 463.208 92.96 459.944 92.96ZM522.276 110.432C518.692 110.432 515.108 110.144 511.524 109.568C508.004 108.992 504.964 108.128 502.404 106.976C500.612 106.144 499.364 105.056 498.66 103.712C497.956 102.368 497.668 100.96 497.796 99.488C497.988 98.08 498.532 96.8 499.428 95.648C500.324 94.56 501.444 93.824 502.788 93.44C504.196 93.12 505.764 93.344 507.492 94.112C509.22 94.944 511.14 95.584 513.252 96.032C515.428 96.544 517.444 96.8 519.3 96.8C522.756 96.8 525.54 96.192 527.652 94.976C529.764 93.76 531.076 91.648 531.588 88.64L532.548 82.688L533.22 82.784C531.812 85.472 529.7 87.488 526.884 88.832C524.132 90.112 521.22 90.752 518.148 90.752C514.308 90.752 510.948 90.016 508.068 88.544C505.188 87.008 502.948 84.8 501.348 81.92C499.748 78.976 498.948 75.424 498.948 71.264C498.948 67.424 499.556 63.84 500.772 60.512C501.988 57.12 503.652 54.176 505.764 51.68C507.94 49.12 510.5 47.136 513.444 45.728C516.452 44.256 519.748 43.52 523.332 43.52C526.788 43.52 529.796 44.256 532.356 45.728C534.916 47.2 536.74 49.28 537.828 51.968L536.388 56.96L536.964 52.832C537.476 49.76 538.628 47.488 540.42 46.016C542.212 44.48 544.58 43.712 547.524 43.712C550.34 43.712 552.388 44.672 553.668 46.592C555.012 48.512 555.396 51.168 554.82 54.56L549.636 87.68C548.548 94.72 545.7 100.256 541.092 104.288C536.548 108.384 530.276 110.432 522.276 110.432ZM524.58 77.12C526.628 77.12 528.388 76.544 529.86 75.392C531.332 74.176 532.452 72.608 533.22 70.688C533.988 68.768 534.372 66.656 534.372 64.352C534.372 62.24 533.764 60.512 532.548 59.168C531.396 57.824 529.668 57.152 527.364 57.152C525.38 57.152 523.652 57.728 522.18 58.88C520.708 60.032 519.588 61.6 518.82 63.584C518.052 65.504 517.668 67.648 517.668 70.016C517.668 72.064 518.244 73.76 519.396 75.104C520.612 76.448 522.34 77.12 524.58 77.12Z'
            fill='#4F5EFE' />
          <path
            d='M117.331 53.0309C113.903 52.956 110.581 54.2496 108.096 56.6198C105.61 58.9904 104.165 62.2435 104.078 65.6707C103.99 69.0978 105.268 72.4204 107.629 74.9145C109.991 77.4082 113.243 78.8693 116.669 78.9691C117.103 78.9817 117.536 78.9943 117.969 79.0069C125.766 79.2336 133.562 79.4603 141.359 79.687C141.792 79.6996 142.226 79.7122 142.659 79.7248C146.123 79.8257 149.48 78.5452 151.992 76.1577C154.504 73.7707 155.965 70.4722 156.054 66.9952C156.143 63.5183 154.851 60.1497 152.464 57.6378C150.077 55.1255 146.789 53.6756 143.324 53.5999C142.891 53.5905 142.458 53.581 142.025 53.5715C134.227 53.4008 126.428 53.23 118.63 53.0593C118.197 53.0498 117.764 53.0404 117.331 53.0309Z'
            fill='#DFE2FF' />
          <path
            d='M30.668 15.334C30.668 11.3663 29.0919 7.56121 26.2863 4.75567C23.4808 1.95012 19.6756 0.373985 15.708 0.373985C11.7404 0.373985 7.93524 1.95012 5.12969 4.75567C2.32415 7.56121 0.748009 11.3663 0.748009 15.334C0.748009 17.7481 0.748009 20.1621 0.748009 22.5762C0.748009 27.237 0.748009 31.8977 0.748009 36.5585C0.748009 43.6333 0.748009 50.7081 0.748009 57.783C0.718005 61.8462 2.44842 66.032 5.34891 68.8904C8.20758 71.7907 12.3923 73.52 16.456 73.4887C25.806 73.415 35.156 71.621 44.506 71.621C53.856 71.621 63.206 73.415 72.556 73.4887C68.8876 73.5183 65.0901 71.9515 62.5067 69.3283C59.8835 66.7449 58.316 62.948 58.344 59.279C58.344 66.6031 58.344 73.9273 58.344 81.2515C58.344 86.1616 58.344 91.0717 58.344 95.9818C58.344 98.3958 58.344 100.81 58.344 103.224C58.344 107.192 59.9201 110.997 62.7257 113.802C65.5312 116.608 69.3364 118.184 73.304 118.184C77.2716 118.184 81.0768 116.608 83.8823 113.802C86.6879 110.997 88.264 107.192 88.264 103.224C88.264 100.81 88.264 98.3958 88.264 95.9818C88.264 91.0717 88.264 86.1616 88.264 81.2515C88.264 73.9273 88.264 66.6031 88.264 59.279C88.294 55.2176 86.5649 51.0313 83.6633 48.1717C80.8037 45.2701 76.6168 43.5417 72.556 43.5733C63.206 43.6469 53.856 45.441 44.506 45.441C35.156 45.441 25.806 43.6469 16.456 43.5733C20.1273 43.5439 23.9227 45.1115 26.5052 47.7334C29.1273 50.3157 30.696 54.1121 30.668 57.783C30.668 50.7081 30.668 43.6333 30.668 36.5585C30.668 31.8977 30.668 27.237 30.668 22.5762C30.668 20.1621 30.668 17.7481 30.668 15.334Z'
            fill='#DFE2FF' />
          <path
            d='M88.6382 15.521C88.6382 24.093 81.6893 31.042 73.1172 31.042C64.5451 31.042 57.5962 24.093 57.5962 15.521C57.5962 6.94899 64.5451 0 73.1172 0C81.6893 0 88.6382 6.94899 88.6382 15.521Z'
            fill='#4F5EFE' />
          <path
            d='M15.521 118.932C24.093 118.932 31.042 111.983 31.042 103.411C31.042 94.839 24.093 87.89 15.521 87.89C6.94899 87.89 0 94.839 0 103.411C0 111.983 6.94899 118.932 15.521 118.932Z'
            fill='#4F5EFE' />
          <path
            d='M202.668 15.334C202.668 11.3663 201.092 7.56121 198.286 4.75567C195.481 1.95012 191.676 0.373985 187.708 0.373985C183.74 0.373985 179.935 1.95012 177.13 4.75567C174.324 7.56121 172.748 11.3663 172.748 15.334C172.748 17.7481 172.748 20.1621 172.748 22.5762C172.748 27.237 172.748 31.8977 172.748 36.5585C172.748 43.6333 172.748 50.7081 172.748 57.783C172.718 61.8462 174.448 66.032 177.349 68.8904C180.208 71.7907 184.392 73.52 188.456 73.4887C197.806 73.415 207.156 71.621 216.506 71.621C225.856 71.621 235.206 73.415 244.556 73.4887C240.888 73.5183 237.09 71.9515 234.507 69.3283C231.884 66.7449 230.316 62.948 230.344 59.279C230.344 66.6031 230.344 73.9273 230.344 81.2515C230.344 86.1616 230.344 91.0717 230.344 95.9818C230.344 98.3958 230.344 100.81 230.344 103.224C230.344 107.192 231.92 110.997 234.726 113.802C237.531 116.608 241.336 118.184 245.304 118.184C249.272 118.184 253.077 116.608 255.882 113.802C258.688 110.997 260.264 107.192 260.264 103.224C260.264 100.81 260.264 98.3958 260.264 95.9818C260.264 91.0717 260.264 86.1616 260.264 81.2515C260.264 73.9273 260.264 66.6031 260.264 59.279C260.294 55.2176 258.565 51.0313 255.663 48.1717C252.804 45.2701 248.617 43.5417 244.556 43.5733C235.206 43.6469 225.856 45.441 216.506 45.441C207.156 45.441 197.806 43.6469 188.456 43.5733C192.127 43.5439 195.923 45.1115 198.505 47.7334C201.127 50.3157 202.696 54.1121 202.668 57.783C202.668 50.7081 202.668 43.6333 202.668 36.5585C202.668 31.8977 202.668 27.237 202.668 22.5762C202.668 20.1621 202.668 17.7481 202.668 15.334Z'
            fill='#4F5EFE' />
          <path
            d='M260.638 15.521C260.638 24.093 253.689 31.042 245.117 31.042C236.545 31.042 229.596 24.093 229.596 15.521C229.596 6.94899 236.545 0 245.117 0C253.689 0 260.638 6.94899 260.638 15.521Z'
            fill='#DFE2FF' />
          <path
            d='M187.521 118.932C196.093 118.932 203.042 111.983 203.042 103.411C203.042 94.839 196.093 87.89 187.521 87.89C178.949 87.89 172 94.839 172 103.411C172 111.983 178.949 118.932 187.521 118.932Z'
            fill='#DFE2FF' />
        </svg>
      </a>
      <nav class="navbar navbar-static-top">
        <a href="#" class="sidebar-toggle" data-toggle="push-menu" role="button">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </a>
        <div class="navbar-custom-menu">
          <ul class="nav navbar-nav">
            <li class="user-menu">
              <a href="{{ route('account') }}">

                <span class="hidden-xs">{{ Auth::user()->name_first }} {{ Auth::user()->name_last }}</span>
              </a>
            </li>
            <li>
            <li><a href="{{ route('index') }}" data-toggle="tooltip" data-placement="bottom"
                title="Exit Admin Control"><i class="fa fa-server"></i></a></li>
            </li>
            <li>
            <li><a href="{{ route('auth.logout') }}" id="logoutButton" data-toggle="tooltip" data-placement="bottom"
                title="Logout"><i class="fa fa-sign-out"></i></a></li>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <aside class="main-sidebar">
      <section class="sidebar">
        <ul class="sidebar-menu">
          <li class="header">BASIC ADMINISTRATION</li>
          <li class="{{ Route::currentRouteName() !== 'admin.index' ?: 'active' }}">
            <a href="{{ route('admin.index') }}">
              <i class="bi bi-house-fill"></i> <span>Overview</span>
            </a>
          </li>
          <li class="{{ !starts_with(Route::currentRouteName(), 'admin.settings') ?: 'active' }}">
            <a href="{{ route('admin.settings')}}">
              <i class="bi bi-gear-fill"></i> <span>Settings</span>
            </a>
          </li>
          <li class="{{ !starts_with(Route::currentRouteName(), 'admin.api') ?: 'active' }}">
            <a href="{{ route('admin.api.index')}}">
              <i class="bi bi-globe"></i> <span>Application API</span>
            </a>
          </li>
          <li class="header">MANAGEMENT</li>
          <li class="{{ !starts_with(Route::currentRouteName(), 'admin.databases') ?: 'active' }}">
            <a href="{{ route('admin.databases') }}">
              <i class="bi bi-database-fill"></i> <span>Databases</span>
            </a>
          </li>
          <li class="{{ !starts_with(Route::currentRouteName(), 'admin.locations') ?: 'active' }}">
            <a href="{{ route('admin.locations') }}">
              <i class="bi bi-globe-americas"></i> <span>Locations</span>
            </a>
          </li>
          <li class="{{ !starts_with(Route::currentRouteName(), 'admin.nodes') ?: 'active' }}">
            <a href="{{ route('admin.nodes') }}">
              <i class="bi bi-hdd-fill"></i> <span>Nodes</span>
            </a>
          </li>
          <li class="{{ !starts_with(Route::currentRouteName(), 'admin.servers') ?: 'active' }}">
            <a href="{{ route('admin.servers') }}">
              <i class="bi bi-hdd-stack-fill"></i> <span>Servers</span>
            </a>
          </li>
          <li class="{{ !starts_with(Route::currentRouteName(), 'admin.users') ?: 'active' }}">
            <a href="{{ route('admin.users') }}">
              <i class="bi bi-people-fill"></i> <span>Users</span>
            </a>
          </li>
          <li class="header">SERVICE MANAGEMENT</li>
          <li class="{{ !starts_with(Route::currentRouteName(), 'admin.mounts') ?: 'active' }}">
            <a href="{{ route('admin.mounts') }}">
              <i class="bi bi-magic"></i> <span>Mounts</span>
            </a>
          </li>
          <li class="{{ !starts_with(Route::currentRouteName(), 'admin.nests') ?: 'active' }}">
            <a href="{{ route('admin.nests') }}">
              <i class="bi bi-egg-fill"></i> <span>Nests</span>
            </a>
          </li>
        </ul>
      </section>
    </aside>
    <div class="content-wrapper">
      <section class="content-header">
        @yield('content-header')
      </section>
      <section class="content">
        <div class="row">
          <div class="col-xs-12">
            @if (count($errors) > 0)
              <div class="alert alert-danger">
                There was an error validating the data provided.<br><br>
                <ul>
                  @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                  @endforeach
                </ul>
              </div>
            @endif
            @foreach (Alert::getMessages() as $type => $messages)
              @foreach ($messages as $message)
                <div class="alert alert-{{ $type }} alert-dismissable" role="alert">
                  {{ $message }}
                </div>
              @endforeach
            @endforeach
          </div>
        </div>
        @yield('content')
      </section>
    </div>
    <footer class="main-footer">
      <div class="pull-right small text-zinc" style="margin-right:10px;margin-top:-7px;">
        <strong><i class="fa fa-fw {{ $appIsGit ? 'fa-git-square' : 'fa-code-fork' }}"></i></strong>
        {{ $appVersion }}<br />
        <strong><i class="fa fa-fw fa-clock-o"></i></strong> {{ round(microtime(true) - LARAVEL_START, 3) }}s
      </div>
      Copyright &copy; 2015 - {{ date('Y') }} <a href="https://h-heberg.fr">H-Heberg</a>, Panel based on Pyrodactyl by
      <a href="https://pyro.host/">Pyro.
        Inc</a>.
    </footer>
  </div>
  @section('footer-scripts')
  <script src="/js/keyboard.polyfill.js" type="application/javascript"></script>
  <script>keyboardeventKeyPolyfill.polyfill();</script>

  {!! Theme::js('vendor/jquery/jquery.min.js?t={cache-version}') !!}
  {!! Theme::js('vendor/sweetalert/sweetalert.min.js?t={cache-version}') !!}
  {!! Theme::js('vendor/bootstrap/bootstrap.min.js?t={cache-version}') !!}
  {!! Theme::js('vendor/slimscroll/jquery.slimscroll.min.js?t={cache-version}') !!}
  {!! Theme::js('vendor/adminlte/app.min.js?t={cache-version}') !!}
  {!! Theme::js('vendor/bootstrap-notify/bootstrap-notify.min.js?t={cache-version}') !!}
  {!! Theme::js('vendor/select2/select2.full.min.js?t={cache-version}') !!}
  {!! Theme::js('js/admin/functions.js?t={cache-version}') !!}
  <script src="/js/autocomplete.js" type="application/javascript"></script>

  @if(Auth::user()->root_admin)
    <script>
      $('#logoutButton').on('click', function (event) {
        event.preventDefault();

        var that = this;
        swal({
          title: 'Do you want to log out?',
          type: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d9534f',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Log out'
        }, function () {
          $.ajax({
            type: 'POST',
            url: '{{ route('auth.logout') }}',
            data: {
              _token: '{{ csrf_token() }}'
            }, complete: function () {
              window.location.href = '{{route('auth.login')}}';
            }
          });
        });
      });
    </script>
  @endif

  <script>
    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    })
  </script>
  @show
</body>

</html>