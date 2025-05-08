const express = require('express');
const app = express();
const port = 3002;
const mongoose = require('mongoose');
const session = require('express-session');
const Employee = require('./models/Employee');
const Admin = require('./models/Admin');
const Review = require('./models/Review');
const Application = require('./models/Application');
const About = require('./models/About');
const Request = require('./models/Request');
const Service = require('./models/Service');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const path = require('path');


app.listen(port, function () {
    console.log(`http://localhost:${port}`);
});

// Раздача статики
app.use(express.static('public'));

// Настройка handlebars
const hbs = require('hbs');
app.set('views', 'views');
app.set('view engine', 'hbs');
// Настройка POST-запроса
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка сессий
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Настройка Multer для загрузки изображений
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/team');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// Настройка БД
mongoose.connect('mongodb://127.0.0.1:27017/dips');

// Роуты
app.get('/', async function (req, res) {
    res.render('index');   
});

app.get('/uslugi', async function (req, res) {
    try {
        const services = await Service.find();
        res.render('uslugi', { services });
    } catch (error) {
        res.status(500).send('Ошибка при загрузке услуг');
    }
});

app.get('/uslugi_koordinaciya', async function (req, res) {
    res.render('uslugi_koordinaciya');   
});

app.get('/uslugi_dekor', async function (req, res) {
    res.render('uslugi_dekor');   
});

app.get('/uslugi_foto', async function (req, res) {
    res.render('uslugi_foto');   
});

app.get('/uslugi_banket', async function (req, res) {
    res.render('uslugi_banket');   
});

app.get('/uslugi_leader', async function (req, res) {
    res.render('uslugi_leader');
});

// Маршрут для страницы "О нас"
app.get('/about', async (req, res) => {
    try {
        const about = await About.findOne();
        res.render('about', { about });
    } catch (error) {
        res.status(500).send('Ошибка при загрузке данных');
    }
});

// Маршрут для страницы админ "О нас" 
app.get('/admin', async (req, res) => {
        if (!req.session.adminId) {
            return res.redirect('/admin-login');
        }
    
    try {
        const about = await About.findOne();
        if (!about) {
            return res.status(404).send('Данные не найдены');
        }
        res.render('admin', { about });
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        res.status(500).send('Ошибка при загрузке данных');
    }
});

// Маршрут для добавления нового сотрудника
app.post('/add-team-member', upload.single('image'), async (req, res) => {
    try {
        const { name, position } = req.body;
        const image = '/img/team/' + req.file.filename; 

        const about = await About.findOne();
        if (about) {
            about.team.push({ name, position, image });
            await about.save();
        } else {
            const newAbout = new About({
                team: [{ name, position, image }]
            });
            await newAbout.save();
        }
        res.redirect('/admin');
    } catch (error) {
        console.error('Ошибка при добавлении сотрудника:', error);
        res.status(500).send('Ошибка при добавлении сотрудника');
    }
});

// Маршрут для удаления сотрудника
app.post('/delete-team-member/:id', async (req, res) => {
    try {
        const teamMemberId = req.params.id;

        const about = await About.findOne();
        if (about) {
            about.team = about.team.filter(member => member._id.toString() !== teamMemberId);
            await about.save();
        }

        res.redirect('/admin');
    } catch (error) {
        console.error('Ошибка при удалении сотрудника:', error);
        res.status(500).send('Ошибка при удалении сотрудника');
    }
});

// Маршрут для получания одобренные отзывов.
app.get('/otzyvy', async function (req, res) {
    try {
        const reviews = await Review.find({ status: 'approved' });
        res.render('otzyvy', { reviews });
    } catch (error) {
        res.status(500).send('Ошибка при загрузке отзывов');
    }
});

// Обработка POST-запроса для отправки отзыва
app.post('/submit-review', async function (req, res) {
    const { name, email, message } = req.body;

    try {
        const review = new Review({ name, email, message });
        await review.save();
        res.send('Ваш отзыв принят');
    } catch (error) {
        res.status(500).send('Ошибка при сохранении отзыва');
    }
});

app.get('/api/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({}); 
        res.json(reviews); 
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при загрузке отзывов' });
    }
});


app.post('/api/moderate-review/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        if (status === 'rejected') {
            
            await Review.findByIdAndDelete(id);
        } else {
           
            await Review.findByIdAndUpdate(id, { status });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Ошибка при модерации отзыва' });
    }
});

app.delete('/api/reviews/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedReview = await Review.findByIdAndDelete(id);
        if (!deletedReview) {
            return res.status(404).json({ success: false, error: 'Отзыв не найден' });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Ошибка при удалении отзыва' });
    }
});


// Обработка POST-запроса для отправки заявки
app.post('/submit-application', async function (req, res) {
    const { name, phone, email, message } = req.body;

    try {
        const application = new Application({ name, phone, email, message });
        await application.save();
        res.send('Ваша заявка принята');
    } catch (error) {
        res.status(500).send('Ошибка при сохранении заявки');
    }
});

// Генерация PDF-файла с заявками
function generatePdf(applications, res) {
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="applications.pdf"');

    const fontPath = './fonts/Roboto-Regular.ttf'; 
    doc.registerFont('Roboto', fontPath);

    doc.pipe(res);

    doc.font('Roboto').fontSize(18).text('Список заявок', { align: 'center' });
    doc.moveDown();

    applications.forEach((application, index) => {
        doc.font('Roboto').fontSize(14).text(`Заявка №${index + 1}`);
        doc.font('Roboto').fontSize(12).text(`Имя: ${application.name}`);
        doc.font('Roboto').fontSize(12).text(`Телефон: ${application.phone}`);
        doc.font('Roboto').fontSize(12).text(`E-mail: ${application.email}`);
        doc.font('Roboto').fontSize(12).text(`Сообщение: ${application.message}`);
        doc.moveDown();
    });

    doc.end();
}

// Маршрут для админа и сотрудника на скачку рдф
app.get('/gener-pdf', async function (req, res) {
    if (!req.session.employeeId) {
        return res.status(403).send('Доступ запрещен');
    }

    try {
        const applications = await Application.find();
        generatePdf(applications, res);
    } catch (error) {
        res.status(500).send('Ошибка при генерации PDF');
    }
});

// Маршрут для администратора
app.get('/admin-gener-pdf', async function (req, res) {
    if (!req.session.adminId) {
        return res.status(403).send('Доступ запрещен');
    }

    try {
        const applications = await Application.find();
        generatePdf(applications, res);
    } catch (error) {
        res.status(500).send('Ошибка при генерации PDF');
    }
});

// Страница входа для сотрудника
app.get('/login', function (req, res) {
    res.render('login');
});

// Обработка POST-запроса для входа сотрудника
app.post('/login', async function (req, res) {
    const { username, password } = req.body;

    try {
        const employee = await Employee.findOne({ username, password });
        if (employee) {
            req.session.employeeId = employee._id;
            res.redirect('/moderation');
        } else {
            res.send('Неверный логин или пароль');
        }
    } catch (error) {
        res.status(500).send('Ошибка при входе');
    }
});

// Страница модерации отзывов
app.get('/moderation', async function (req, res) {
    if (!req.session.employeeId) {
        return res.redirect('/login');
    }

    try {
        const reviews = await Review.find({ status: 'pending' });
        res.render('moderation', { reviews });
    } catch (error) {
        res.status(500).send('Ошибка при загрузке отзывов');
    }
});

// Обработка POST-запроса для модерации отзыва
app.post('/moderate-review/:id', async function (req, res) {
    if (!req.session.employeeId) {
        return res.redirect('/login');
    }

    const { status } = req.body;
    const reviewId = req.params.id;

    try {
        if (status === 'rejected') {
            await Review.findByIdAndDelete(reviewId);
        } else {
            await Review.findByIdAndUpdate(reviewId, { status });
        }
        res.redirect('/moderation');
    } catch (error) {
        res.status(500).send('Ошибка при модерации отзыва');
    }
});

// Выход сотрудника
app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/login');
});


// Страница входа для администратора
app.get('/admin-login', function (req, res) {
    res.render('admin-login');
});

// Обработка POST-запроса для входа администратора
app.post('/admin-login', async function (req, res) {
    const { username, password } = req.body;

    try {
        const admin = await Admin.findOne({ username, password });
        if (admin) {
            req.session.adminId = admin._id; 
            res.redirect('/admin');
       } else {
           res.send('Неверный логин или пароль');
       }
    } catch (error) {
        res.status(500).send('Ошибка при входе');
   }
});

// Выход из системы для администратора
    app.get('/admin-logout', function (req, res) {
        req.session.destroy(); 
        res.redirect('/admin-login'); 
});


// Маршрут для отображения HTML
app.get('/checklist', async (req, res) => {
    try {
        res.render('checklist'); // Отправляем HTML-страницу
    } catch (error) {
        res.status(500).send('Ошибка при загрузке данных');
    }
});

// Маршрут для получения JSON-данных
app.get('/api/checklist', async (req, res) => {
    try {
        const requests = await Request.find({}); // Получаем данные из MongoDB
        res.json(requests); // Отправляем JSON-данные
    } catch (error) {
        res.status(500).json({ error: 'Ошибка при загрузке данных' });
    }
});

// Маршрут для удаления записи
app.delete('/api/checklist/:id', async (req, res) => {
    const { id } = req.params;

    // Проверка, что ID является корректным ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, error: 'Неверный ID записи' });
    }

    try {
        const deletedRequest = await Request.findByIdAndDelete(id);

        if (!deletedRequest) {
            return res.status(404).json({ success: false, error: 'Запись не найдена' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('123:', error);
        res.status(500).json({ success: false, error: '123' });
    }
});

// Обработка POST-запроса для отправки запроса на помощь
app.post('/submit-request', async (req, res) => {
    const { name, phone, email, message } = req.body;

    try {
        const request = new Request({ name, phone, email, message });
        await request.save();
        res.send('Ваш запрос принят');
    } catch (error) {
        res.status(500).send('Ошибка при сохранении запроса');
    }
});

// Маршрут для изменения статуса заявки
app.post('/moderate-request/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await Request.findByIdAndUpdate(id, { status }); 
        res.redirect('/checklist'); 
    } catch (error) {
        res.status(500).send('Ошибка при обновлении статуса');
    }
});


// Настройка Multer для загрузки изображений услуг
const serviceStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img/services');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const uploadService = multer({ storage: serviceStorage });

// Маршруты для управления услугами
app.get('/admin/services', async (req, res) => {
    if (!req.session.adminId) {
        return res.redirect('/admin-login');
    }
    
    try {
        const services = await Service.find();
        res.render('admin-services', { services });
    } catch (error) {
        res.status(500).send('Ошибка при загрузке услуг');
    }
});

// Добавление новой услуги
app.post('/add-service', uploadService.single('image'), async (req, res) => {
    if (!req.session.adminId) {
        return res.status(403).send('Доступ запрещен');
    }
    
    try {
        const { title, description, link } = req.body;
        const image = '/img/services/' + req.file.filename;

        const newService = new Service({ title, description, image, link });
        await newService.save();
        
        res.redirect('/admin/services');
    } catch (error) {
        res.status(500).send('Ошибка при добавлении услуги');
    }
});

// Удаление услуги
app.post('/delete-service/:id', async (req, res) => {
    if (!req.session.adminId) {
        return res.status(403).send('Доступ запрещен');
    }
    
    try {
        await Service.findByIdAndDelete(req.params.id);
        res.redirect('/admin/services');
    } catch (error) {
        res.status(500).send('Ошибка при удалении услуги');
    }
});

// Обновление услуги
app.post('/update-service/:id', uploadService.single('image'), async (req, res) => {
    if (!req.session.adminId) {
        return res.status(403).send('Доступ запрещен');
    }
    
    try {
        const { title, description, link } = req.body;
        const updateData = { title, description, link };
        
        if (req.file) {
            updateData.image = '/img/services/' + req.file.filename;
        }
        
        await Service.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/admin/services');
    } catch (error) {
        res.status(500).send('Ошибка при обновлении услуги');
    }
});